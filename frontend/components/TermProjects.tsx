import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Taller } from '@/services/tallerService';

interface TermProjectsProps {
  term: '2nd' | '3rd';
  projects: Taller[];
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  updateProjectCount: (term: '2nd' | '3rd', project: string, count: string) => void;
  openStudentSelection: (term: '2nd' | '3rd', project: string) => void;
  toggleReferentProject: (term: '2nd' | '3rd', project: string) => void;
}

export default function TermProjects({
  term,
  projects,
  formData,
  setFormData,
  updateProjectCount,
  openStudentSelection,
  toggleReferentProject
}: TermProjectsProps) {
  const projectKey = term === '2nd' ? 'projects2ndTerm' : 'projects3rdTerm';
  const referentKey = term === '2nd' ? 'referentProjects2ndTerm' : 'referentProjects3rdTerm';
  const referentNameKey = term === '2nd' ? 'referentName2nd' : 'referentName3rd';
  const referentEmailKey = term === '2nd' ? 'referentEmail2nd' : 'referentEmail3rd';

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-4">{term === '2nd' ? "Reptes 2n Trimestre" : "Reptes 3r Trimestre"}</Text>

      {projects.map(project => {
        const count = formData[projectKey][project.titol]?.count || '';
        const assignedCount = formData[projectKey][project.titol]?.selectedStudents?.length || 0;
        return (
          <View key={project._id} className="mb-4 border-b border-gray-100 pb-4">
            <Text className="font-bold text-gray-800 text-base mb-2">{project.titol}</Text>
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-600 w-32">Nombre d'alumnes:</Text>
              <TextInput
                className="border border-gray-300 rounded p-2 w-20 text-center"
                keyboardType="numeric"
                value={count}
                onChangeText={val => updateProjectCount(term, project.titol, val)}
                placeholder="0"
              />
              <TouchableOpacity
                className="bg-blue-100 ml-4 p-2 rounded-lg"
                onPress={() => openStudentSelection(term, project.titol)}
              >
                <Text className="text-blue-700 font-medium">Assignar ({assignedCount})</Text>
              </TouchableOpacity>
            </View>
            {/* Referent Selection Checkbox */}
            <TouchableOpacity
              className="flex-row items-center mt-1"
              onPress={() => toggleReferentProject(term, project.titol)}
            >
              <Ionicons
                name={formData[referentKey].includes(project.titol) ? "checkbox" : "square-outline"}
                size={20}
                color="#4B5563"
              />
              <Text className="ml-2 text-gray-600 text-sm">Aquest projecte tindrà referent del centre</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View className="mt-4 pt-4 border-t border-gray-200">
        <Text className="text-gray-700 font-medium mb-2">Dades del Referent ({term === '2nd' ? '2n' : '3r'} Trimestre)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-2"
          placeholder="Nom del Professor/a Referent"
          value={String(formData[referentNameKey])}
          onChangeText={text => setFormData({ ...formData, [referentNameKey]: text })}
        />
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Email del Professor/a Referent"
          value={String(formData[referentEmailKey])}
          onChangeText={text => setFormData({ ...formData, [referentEmailKey]: text })}
        />
      </View>
    </View>
  );
}