import { Stack } from 'expo-router';

export default function ProfessorStackLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: 'white',
      },
      headerTintColor: '#00426B',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sesion/[id]" options={{ title: 'Sesión' }} />
      <Stack.Screen name="evaluacion/[id]" options={{ title: 'Evaluación' }} />
    </Stack>
  );
}
