import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import "@/global.css"
import { AuthProvider, useAuth } from '../context/AuthContext'; // Import AuthProvider and useAuth
import * as SplashScreen from 'expo-splash-screen'; // Keep SplashScreen import for initial hide


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { authState } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    // Hide splash screen as soon as auth state is loaded, regardless of authentication status
    SplashScreen.hideAsync();

    if (!authState.authenticated && !inAuthGroup) {
      // User is not authenticated and not in the auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (authState.authenticated && inAuthGroup) {
      // User is authenticated and in the auth group, redirect to main tabs
      router.replace('/(tabs)');
    }
  }, [authState.authenticated, inAuthGroup]);


  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}