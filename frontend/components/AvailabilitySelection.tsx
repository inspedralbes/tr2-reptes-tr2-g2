import { View, Text, TouchableOpacity } from 'react-native';

interface AvailabilitySelectionProps {
  formData: {
    availability: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function AvailabilitySelection({
  formData,
  setFormData
}: AvailabilitySelectionProps) {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Disponibilitat</Text>
      <View className="flex-row gap-2 mt-2">
        {["Dimarts", "Dijous", "Dimarts i Dijous"].map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFormData({ ...formData, availability: opt })}
            className={`flex-1 p-3 rounded-lg border justify-center items-center ${formData.availability === opt
              ? "bg-blue-50 border-blue-600"
              : "bg-white border-gray-300"
              } `}
          >
            <Text className={formData.availability === opt ? "text-blue-700 font-bold" : "text-gray-600"}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}