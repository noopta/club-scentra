import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import StepIndicator from '@/components/StepIndicator';
import RedButton from '@/components/RedButton';
import * as ImagePicker from 'expo-image-picker';
import { events as eventsApi, uploads } from '@/lib/api';

export default function CreateEventPhotoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string; description: string;
    addressLine: string; city: string; region: string; postalCode: string;
    startAt: string; endAt: string;
  }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload an event photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!params.title) {
      Alert.alert('Error', 'Event title is missing. Please go back and try again.');
      return;
    }
    setCreating(true);
    try {
      let imageUrl: string | undefined;

      if (imageUri) {
        setUploading(true);
        const uploaded = await uploads.uploadImage(imageUri);
        imageUrl = uploaded.url;
        setUploading(false);
      }

      await eventsApi.create({
        title: params.title,
        description: params.description ?? '',
        startAt: params.startAt,
        endAt: params.endAt || undefined,
        addressLine: params.addressLine || undefined,
        city: params.city || undefined,
        region: params.region || undefined,
        postalCode: params.postalCode || undefined,
        imageUrl: imageUrl ?? null,
      });

      Alert.alert('Success!', 'Your event has been created.', [
        { text: 'View My Meets', onPress: () => router.replace('/(tabs)/meets') },
      ]);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not create event. Please try again.');
    } finally {
      setCreating(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={4} currentStep={4} />

        <Text style={styles.title}>Add a Pic</Text>
        <Text style={styles.subtitle}>Upload a photo for your event</Text>

        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} activeOpacity={0.7}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.uploadText}>Tap to upload</Text>
              <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB</Text>
            </>
          )}
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickImage}>
            <Ionicons name="pencil-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        )}

        {(creating || uploading) ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Theme.colors.primary} />
            <Text style={styles.loadingText}>{uploading ? 'Uploading photo...' : 'Creating event...'}</Text>
          </View>
        ) : (
          <RedButton title="Create Event" onPress={handleCreate} />
        )}

        <TouchableOpacity style={styles.skipBtn} onPress={handleCreate} disabled={creating}>
          <Text style={styles.skipText}>Skip photo and create event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flex: 1, paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.xxl },
  title: { fontSize: Theme.fontSize.xxxl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.xxl },
  uploadArea: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.lg, borderWidth: 2, borderColor: Theme.colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', height: 200, marginBottom: Theme.spacing.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', borderRadius: Theme.borderRadius.lg },
  uploadText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textSecondary, marginTop: Theme.spacing.sm },
  uploadSubtext: { fontSize: Theme.fontSize.sm, color: Theme.colors.textMuted, marginTop: Theme.spacing.xs },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: Theme.spacing.md },
  changePhotoText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, fontWeight: Theme.fontWeight.medium },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.lg, marginBottom: Theme.spacing.md },
  loadingText: { fontSize: Theme.fontSize.md, color: Theme.colors.textPrimary },
  skipBtn: { alignItems: 'center', paddingVertical: Theme.spacing.md },
  skipText: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, textDecorationLine: 'underline' },
});
