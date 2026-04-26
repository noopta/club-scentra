import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
  ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '@/constants/Theme';
import { uploads, social } from '@/lib/api';

export default function CreatePostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string;
    eventTitle?: string;
    eventImage?: string;
  }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const tiedToEvent = !!params.eventId;

  const pickImage = async (source: 'library' | 'camera') => {
    setBanner(null);
    try {
      let perm;
      if (source === 'camera') {
        perm = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!perm.granted) {
        setBanner({
          kind: 'error',
          text: source === 'camera'
            ? 'Camera permission is required to take a photo.'
            : 'Photo library permission is required to pick a photo.',
        });
        return;
      }

      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: true,
        aspect: [9, 16],
      };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e: unknown) {
      setBanner({
        kind: 'error',
        text: e instanceof Error ? e.message : 'Could not access image.',
      });
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || submitting) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const { url } = await uploads.uploadImage(imageUri);
      await social.createPost({
        imageUrl: url,
        caption: caption.trim() || undefined,
        eventId: params.eventId,
      });
      if (tiedToEvent && params.eventId) {
        router.replace({
          pathname: '/stories',
          params: {
            eventId: params.eventId,
            eventTitle: params.eventTitle,
            eventImage: params.eventImage,
          },
        });
      } else {
        router.back();
      }
    } catch (e: unknown) {
      setBanner({
        kind: 'error',
        text: e instanceof Error ? e.message : 'Could not post. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={28} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {tiedToEvent ? 'Share to this Meet' : 'Post Photo'}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!imageUri || submitting}
          style={[styles.postBtn, (!imageUri || submitting) && styles.postBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {tiedToEvent ? (
        <View style={styles.eventTag}>
          <Ionicons name="location" size={14} color={Theme.colors.primary} />
          <Text style={styles.eventTagText} numberOfLines={1}>
            {params.eventTitle || 'this meet'}
          </Text>
        </View>
      ) : null}

      {banner ? (
        <View style={[styles.banner, banner.kind === 'error' ? styles.bannerError : styles.bannerInfo]}>
          <Text style={styles.bannerText}>{banner.text}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.changeBtn} onPress={() => setImageUri(null)}>
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.changeBtnText}>Change photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerCard}>
            <Ionicons name="images-outline" size={48} color={Theme.colors.textSecondary} />
            <Text style={styles.pickerTitle}>Add a photo</Text>
            <Text style={styles.pickerSub}>Show off your build, the meet vibe, or a clean shot.</Text>
            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => pickImage('library')}>
                <Ionicons name="image-outline" size={20} color={Theme.colors.textPrimary} />
                <Text style={styles.pickerBtnText}>Choose from library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => pickImage('camera')}>
                <Ionicons name="camera-outline" size={20} color={Theme.colors.textPrimary} />
                <Text style={styles.pickerBtnText}>Take a photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder={tiedToEvent ? 'Share what made this meet special…' : 'Say something about this photo…'}
          placeholderTextColor={Theme.colors.textSecondary}
          multiline
          maxLength={2000}
          style={styles.captionInput}
        />
        <Text style={styles.charCount}>{caption.length} / 2000</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  title: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  postBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  eventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFF1E6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  eventTagText: { color: Theme.colors.primary, fontWeight: '600', fontSize: 13, flex: 1 },
  banner: { paddingHorizontal: Theme.spacing.md, paddingVertical: 10 },
  bannerError: { backgroundColor: '#FFE5E5' },
  bannerInfo: { backgroundColor: '#E5F3FF' },
  bannerText: { color: '#B00020', fontSize: 13, fontWeight: '500' },
  scrollBody: { padding: Theme.spacing.md, paddingBottom: 40 },
  pickerCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.textPrimary, marginTop: 12 },
  pickerSub: { fontSize: 13, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  pickerActions: { width: '100%', gap: 10 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
    borderRadius: 10,
  },
  pickerBtnText: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary },
  previewWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  preview: { width: '100%', aspectRatio: 9 / 16, maxHeight: 480 },
  changeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: Theme.colors.textSecondary, marginTop: 20, marginBottom: 8 },
  captionInput: {
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Theme.colors.textSecondary, alignSelf: 'flex-end', marginTop: 4 },
});
