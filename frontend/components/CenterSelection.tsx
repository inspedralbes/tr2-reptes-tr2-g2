import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CenterSelectionProps {
  formData: {
    centerName: string;
    selectedStudents: string[];
    coordinatorName: string;
    coordinatorEmail: string;
    isFirstTime: boolean;
    // ... other fields
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  centers: string[];
  showCenterDropdown: boolean;
  setShowCenterDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CenterSelection({
  formData,
  setFormData,
  centers,
  showCenterDropdown,
  setShowCenterDropdown
}: CenterSelectionProps) {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 z-50">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Informació del Centre Educatiu</Text>

      <View className="mb-4 relative z-50">
        <Text className="text-gray-700 mb-2 font-medium">Selecciona el teu Centre</Text>
        <TouchableOpacity
          onPress={() => setShowCenterDropdown(!showCenterDropdown)}
          className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
        >
          <Text className={formData.centerName ? "text-gray-900" : "text-gray-400"}>
            {formData.centerName || "Tria un centre de la llista..."}
          </Text>
          <Ionicons name={showCenterDropdown ? "chevron-up" : "chevron-down"} size={20} color="gray" />
        </TouchableOpacity>
        {showCenterDropdown && (
          <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1 max-h-60">
            <ScrollView nestedScrollEnabled className="max-h-60">
              {centers.map(center => (
                <TouchableOpacity
                  key={center}
                  className="p-3 border-b border-gray-100 active:bg-blue-50"
                  onPress={() => {
                    setFormData({ ...formData, centerName: center, selectedStudents: [] });
                    setShowCenterDropdown(false);
                  }}
                >
                  <Text className="text-gray-800">{center}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Nom complet del/la coordinador/a</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="Nom i cognoms"
          value={formData.coordinatorName}
          onChangeText={(text) => setFormData({ ...formData, coordinatorName: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Email de contacte</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          placeholder="exemple@centre.cat"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.coordinatorEmail}
          onChangeText={(text) => setFormData({ ...formData, coordinatorEmail: text })}
        />
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-gray-700 font-medium flex-1 pr-4">
          És la primera vegada que participeu a la Modalitat C "Oficis compartits"?
        </Text>
        <Switch
          value={formData.isFirstTime}
          onValueChange={(val) => setFormData({ ...formData, isFirstTime: val })}
          trackColor={{ false: "#767577", true: "#00426B" }}
        />
      </View>
    </View>
  );
}