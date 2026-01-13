import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserTable from '../../components/UserTable';

export default function StudentsPage() {
  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 py-6 ">
        {/* Contenedor que ajusta el ancho al texto */}
        <View className="self-start">
          <Text className="text-2xl font-bold text-gray-900">
            Estudiantes
          </Text>
          {/* Línea azul: w-full hará que mida lo mismo que el View padre (el texto) */}
          <View className="h-1 w-full bg-blue-600 mt-1" />
        </View>

        <Text className="text-gray-500 mt-3 text-sm">
          Registro oficial de inscripciones del centro.
        </Text>
      </View>
      
      <View className="flex-1 border-t border-gray-100">
        <UserTable />
      </View>
    </SafeAreaView>
  );
}