import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import { users, uploads } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName ?? '');
      setUsername(user.username ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleChangePhoto = async () => {
    if (uploadingAvatar) return;

    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert('Permission needed', 'Please allow photo library access to change your profile picture.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setPreviewUri(asset.uri);
    setUploadingAvatar(true);
    try {
      const { url } = await uploads.uploadImage(asset.uri);
      await users.updateMe({ avatarUrl: url });
      try {
        await refreshUser();
      } catch {
        // refresh failure is non-fatal — server already has the new avatar
      }
      setPreviewUri(null);
    } catch (err: unknown) {
      setPreviewUri(null);
      showAlert('Upload failed', err instanceof Error ? err.message : 'Could not upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await users.updateMe({
        displayName: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
      });
      await refreshUser();
      router.back();
    } catch (err: unknown) {
      showAlert('Error', err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  const displayedAvatar = previewUri ?? user?.avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {displayedAvatar ? (
              <Image source={{ uri: displayedAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={40} color={Theme.colors.textMuted} />
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={Theme.colors.white} />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingAvatar}>
            <Text style={[styles.changePhotoText, uploadingAvatar && { opacity: 0.5 }]}>
              {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <InputField label="Name" value={name} onChangeText={setName} />
        <InputField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <InputField label="Bio" value={bio} onChangeText={setBio} multiline />

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 16 }} />
        ) : (
          <RedButton title="Save" onPress={handleSave} />
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Theme.spacing.lg, paddingTop: Theme.spacing.md },
  avatarContainer: { marginBottom: Theme.spacing.sm, position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 45, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { color: c.primary, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium },
});
