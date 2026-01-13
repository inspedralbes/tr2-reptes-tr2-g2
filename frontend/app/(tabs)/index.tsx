import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack, Href } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-4">
      <Text className="text-lg text-center mb-4">
        Esta es la página principal de la aplicación. Aquí puedes gestionar talleres y alumnos, ver estadísticas y acceder a otras secciones.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={() => router.push('/form' as Href)}
      >
        <Text className="text-white text-center font-semibold">Ir al Formulario</Text>
      </TouchableOpacity>
    </View>
  );
}