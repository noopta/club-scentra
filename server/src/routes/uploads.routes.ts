import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';

// ── S3 client (only initialized if credentials are set) ───────────────────────
const s3 =
  env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_BUCKET
    ? new S3Client({
        region: env.S3_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

// ── Local fallback (used when S3 is not configured) ───────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(), // buffer in memory for S3; also fine for local
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    cb(null, ok);
  },
});

const router = Router();

router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file (use multipart field name "file")' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    if (s3 && env.S3_BUCKET) {
      // ── Upload to S3 ────────────────────────────────────────────────────────
      await s3.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      const url = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
      res.status(201).json({ url, key });
    } else {
      // ── Fallback: local disk ─────────────────────────────────────────────────
      const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-z0-9._-]/gi, '_')}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      const base = env.PUBLIC_BASE_URL?.replace(/\/$/, '') || `http://localhost:${env.PORT}`;
      const url = `${base}/uploads/${filename}`;
      res.status(201).json({ url, filename });
    }
  })
);

export default router;
