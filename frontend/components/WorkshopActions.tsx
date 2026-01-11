import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WorkshopActionsProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterPress: () => void;
  onCreatePress: () => void;
};

const WorkshopActions = ({
  searchQuery,
  setSearchQuery,
  onFilterPress,
  onCreatePress,
}: WorkshopActionsProps) => {
  return (
    <View className="p-4 bg-white rounded-lg shadow-md mb-4">
      <View className="flex-row items-center mb-4">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg p-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="ml-2 flex-1"
            placeholder="Buscar talleres..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="flex-row items-center bg-blue-500 p-2 rounded-lg"
          onPress={onFilterPress}
        >
          <Ionicons name="filter" size={20} color="white" />
          <Text className="ml-2 text-white font-bold">Filtrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-green-500 p-2 rounded-lg"
          onPress={onCreatePress}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="ml-2 text-white font-bold">Crear Taller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkshopActions;
