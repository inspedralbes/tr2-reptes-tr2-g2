import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alumne } from '@/services/alumneService';

interface StudentListProps {
  formData: {
    centerName: string;
    selectedStudents: string[];
  };
  filteredStudents: Alumne[];
  toggleStudentSelection: (studentId: string) => void;
}

export default function StudentList({
  formData,
  filteredStudents,
  toggleStudentSelection
}: StudentListProps) {
  if (!formData.centerName) return null;
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Alumnes Participants</Text>
      {filteredStudents.length === 0 ? (
        <Text className="text-gray-500 italic">No hi ha alumnes registrats per aquest centre.</Text>
      ) : (
        <View className="max-h-60">
          <ScrollView nestedScrollEnabled>
            {filteredStudents.map(student => (
              <TouchableOpacity
                key={student._id}
                onPress={() => toggleStudentSelection(student._id)}
                className={`flex-row items-center p-3 mb-2 rounded-lg border ${formData.selectedStudents.includes(student._id)
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <Ionicons
                  name={formData.selectedStudents.includes(student._id) ? "checkbox" : "square-outline"}
                  size={24}
                  color={formData.selectedStudents.includes(student._id) ? "#00426B" : "#9CA3AF"}
                />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-800">{student.nombre} {student.apellido}</Text>
                  <Text className="text-xs text-gray-500">{student.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}