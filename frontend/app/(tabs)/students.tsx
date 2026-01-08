import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListadoUsuarios from '../../components/ListadoUsuarios';

export default function StudentsPage() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200 mb-2">
        <Text className="text-xl font-bold text-gray-800">Estudiantes</Text>
        <Text className="text-gray-500">Listado completo de alumnos</Text>
      </View>
      <View className="flex-1 px-2">
        <ListadoUsuarios />
      </View>
    </SafeAreaView>
  );
}
