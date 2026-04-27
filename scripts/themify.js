#!/usr/bin/env node
// One-shot codemod: transform files using `Theme.colors.*` so styles are computed
// inside the component via `useTheme()` + `useMemo`. Idempotent (skips already-themed files).

const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components'];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

function findMatchingClose(src, openIdx) {
  // openIdx is index of '(' or '{' or '['; return index of matching close
  const open = src[openIdx];
  const close = open === '(' ? ')' : open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = null;
  let i = openIdx;
  while (i < src.length) {
    const ch = src[i];
    if (inStr) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === inStr) inStr = null;
    } else {
      if (ch === '/' && src[i + 1] === '/') {
        const nl = src.indexOf('\n', i);
        i = nl < 0 ? src.length : nl;
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        i = end < 0 ? src.length : end + 2;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; }
      else if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) return i;
      }
    }
    i++;
  }
  return -1;
}

function transform(file) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes("from '@/constants/Theme'")) return null;
  if (!src.includes('Theme.colors.')) return null;
  if (src.includes('useTheme()') || src.includes("from '@/lib/ThemeContext'")) return null; // already themed

  // Find module-level `const styles = StyleSheet.create({...});` blocks.
  const re = /const\s+styles\s*=\s*StyleSheet\.create\s*\(\s*\{/g;
  const blocks = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const openBraceIdx = m.index + m[0].length - 1; // index of '{'
    const closeBraceIdx = findMatchingClose(src, openBraceIdx);
    if (closeBraceIdx < 0) continue;
    // find matching ')' after the '}'
    let i = closeBraceIdx + 1;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== ')') continue;
    const closeParenIdx = i;
    // expect optional ; after )
    let endIdx = closeParenIdx + 1;
    if (src[endIdx] === ';') endIdx++;
    blocks.push({ start: m.index, end: endIdx, openBraceIdx, closeBraceIdx, closeParenIdx });
  }

  if (blocks.length === 0) return null;

  // Replace each block: rename to makeStyles factory, replace Theme.colors. with c. inside body
  // process in reverse order to keep indices valid
  for (const b of blocks.slice().reverse()) {
    const inner = src.slice(b.openBraceIdx, b.closeBraceIdx + 1);
    const newInner = inner.replace(/Theme\.colors\./g, 'c.');
    const replacement =
      'const makeStyles = (c: typeof Theme.colors) => StyleSheet.create(' +
      newInner +
      ');';
    src = src.slice(0, b.start) + replacement + src.slice(b.end);
  }

  // Inject `import { useTheme } from '@/lib/ThemeContext';` after the Theme import
  src = src.replace(
    /(import\s+\{[^}]*\}\s+from\s+'@\/constants\/Theme';)/,
    "$1\nimport { useTheme } from '@/lib/ThemeContext';"
  );

  // Ensure `useMemo` is imported from React.
  if (/import\s+React\s*,\s*\{([^}]*)\}\s*from\s+['"]react['"]/.test(src)) {
    src = src.replace(/import\s+React\s*,\s*\{([^}]*)\}\s*from\s+['"]react['"]/, (full, names) => {
      const list = names.split(',').map(s => s.trim()).filter(Boolean);
      if (!list.includes('useMemo')) list.push('useMemo');
      return `import React, { ${list.join(', ')} } from 'react'`;
    });
  } else if (/import\s+React\s+from\s+['"]react['"]/.test(src)) {
    src = src.replace(/import\s+React\s+from\s+['"]react['"]/, "import React, { useMemo } from 'react'");
  } else if (/import\s+\{([^}]*)\}\s*from\s+['"]react['"]/.test(src)) {
    src = src.replace(/import\s+\{([^}]*)\}\s*from\s+['"]react['"]/, (full, names) => {
      const list = names.split(',').map(s => s.trim()).filter(Boolean);
      if (!list.includes('useMemo')) list.push('useMemo');
      return `import { ${list.join(', ')} } from 'react'`;
    });
  } else {
    // No react import? add one (rare)
    src = "import { useMemo } from 'react';\n" + src;
  }

  // Inject hook + styles at top of the default-exported component function body.
  // Match: export default function Name(...) {  OR  function Name(...) { ... } export default Name;
  const exportFnRe = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/;
  if (exportFnRe.test(src)) {
    src = src.replace(exportFnRe, (full) => {
      return `${full}\n  const { colors } = useTheme();\n  const styles = useMemo(() => makeStyles(colors), [colors]);\n`;
    });
  } else {
    // Try to inject into the first `function ComponentName(...) {` declaration
    const fnRe = /function\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/;
    const m2 = fnRe.exec(src);
    if (m2) {
      const insertAt = m2.index + m2[0].length;
      src = src.slice(0, insertAt)
        + `\n  const { colors } = useTheme();\n  const styles = useMemo(() => makeStyles(colors), [colors]);\n`
        + src.slice(insertAt);
    } else {
      // Could not inject; bail by leaving file as-is is risky since we already mutated styles → no, abort.
      // Restore original by reading again.
      src = fs.readFileSync(file, 'utf8');
      return { skipped: true, reason: 'no component found' };
    }
  }

  fs.writeFileSync(file, src);
  return { transformed: true, blocks: blocks.length };
}

const files = ROOTS.flatMap(r => walk(r));
const results = [];
for (const f of files) {
  try {
    const r = transform(f);
    if (r) results.push({ file: f, ...r });
  } catch (e) {
    results.push({ file: f, error: e.message });
  }
}
console.log(JSON.stringify(results, null, 2));
console.log(`\nProcessed ${results.length} files.`);
