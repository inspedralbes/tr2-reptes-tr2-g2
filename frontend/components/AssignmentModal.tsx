import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alumne } from '@/services/alumneService';

interface AssignmentModalProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  currentProjectSelection: { term: '2nd' | '3rd', project: string } | null;
  formData: any;
  filteredStudents: Alumne[];
  toggleProjectStudent: (studentId: string) => void;
}

export default function AssignmentModal({
  modalVisible,
  setModalVisible,
  currentProjectSelection,
  formData,
  filteredStudents,
  toggleProjectStudent
}: AssignmentModalProps) {
  if (!currentProjectSelection) return null;
  const { term, project } = currentProjectSelection;
  const projectKey = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';
  const assignedIds = formData[projectKey][project]?.selectedStudents || [];

  return (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-center p-4">
        <View className="bg-white rounded-xl p-4 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <Text className="text-xl font-bold text-gray-800 flex-1">Assignar Alumnes</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mb-4 font-medium">Projecte: {project} ({term === '2nd' ? '2n' : '3r'} Trim.)</Text>

          <FlatList
            data={formData.selectedStudents.map((id: string) => filteredStudents.find(s => s._id === id)).filter(Boolean) as Alumne[]}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleProjectStudent(item._id)}
                className={`flex-row items-center p-3 mb-2 rounded-lg border ${assignedIds.includes(item._id)
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <Ionicons
                  name={assignedIds.includes(item._id) ? "checkbox" : "square-outline"}
                  size={24}
                  color={assignedIds.includes(item._id) ? "#16A34A" : "#9CA3AF"}
                />
                <Text className="ml-3 font-medium text-gray-800">{item.nombre} {item.apellido}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text className="text-gray-500 text-center py-4">No has seleccionat cap alumne a la llista general encara.</Text>}
          />
          <TouchableOpacity
            className="bg-blue-600 p-3 rounded-xl mt-4 items-center"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white font-bold">Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}