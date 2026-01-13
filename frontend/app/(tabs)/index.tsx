import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack, Href } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-4">
      <Text className="text-lg text-center mb-4">
        Aquesta és la pàgina principal de l'aplicació. Aquí pots gestionar tallers i alumnes, veure estadístiques i accedir a altres seccions.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={() => router.push('/form' as Href)}
      >
        <Text className="text-white text-center font-semibold">Anar al Formulari</Text>
      </TouchableOpacity>
    </View>
  );
}