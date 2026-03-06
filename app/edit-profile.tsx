import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('Sara Nova');
  const [username, setUsername] = useState('Saraaa13');
  const [bio, setBio] = useState('Just a girl and her car');
  const [car, setCar] = useState('');
  const [location, setLocation] = useState('Toronto');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' }}
              style={styles.avatar}
            />
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <InputField label="Name" value={name} onChangeText={setName} />
        <InputField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <InputField label="Bio" value={bio} onChangeText={setBio} multiline />
        <InputField label="Car" value={car} onChangeText={setCar} placeholder="e.g. A91 Supra" />
        <InputField label="Location" value={location} onChangeText={setLocation} />

        <RedButton title="Save" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  changePhotoText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.primary,
  },
});
