import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="signup-details" />
      <Stack.Screen name="google-auth" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
