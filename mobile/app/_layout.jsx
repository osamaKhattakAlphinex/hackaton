import { Stack } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.surface,
      },
      headerTintColor: COLORS.textPrimary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ProcessingScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ClarificationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ResultsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="TraceScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
