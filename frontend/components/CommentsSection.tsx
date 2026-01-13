import { View, Text, TextInput } from 'react-native';

interface CommentsSectionProps {
  formData: {
    comments: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function CommentsSection({
  formData,
  setFormData
}: CommentsSectionProps) {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Comentaris i Dubtes</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 bg-white h-32"
        multiline
        textAlignVertical="top"
        placeholder="Escriu aquí qualsevol informació addicional..."
        value={formData.comments}
        onChangeText={text => setFormData({ ...formData, comments: text })}
      />
    </View>
  );
}