import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Theme } from '@/constants/Theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return <Redirect href="/(auth)/landing" />;
}
