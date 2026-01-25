import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { THEME } from '@iter/shared';

export default function ProfessorStackLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
      },
      headerTintColor: isDark ? '#E0C5AC' : '#00426B',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontFamily: 'Inter',
      },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sesion/[id]" options={{ title: 'Sesión' }} />
      <Stack.Screen name="evaluacion/[id]" options={{ title: 'Evaluación' }} />
      <Stack.Screen name="questionari/[id]" options={{ title: 'Valoració Taller' }} />
    </Stack>
  );
}
