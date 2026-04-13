import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import { users } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName ?? '');
      setUsername(user.username ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

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
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

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
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={40} color={Theme.colors.textMuted} />
              </View>
            )}
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Theme.spacing.lg, paddingTop: Theme.spacing.md },
  avatarContainer: { marginBottom: Theme.spacing.sm },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  changePhotoText: { color: Theme.colors.primary, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium },
});
