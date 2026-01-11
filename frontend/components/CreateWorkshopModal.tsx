import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tallerService, { Taller } from "../services/tallerService";

type CreateWorkshopModalProps = {
  visible: boolean;
  onClose: () => void;
  onWorkshopCreated: (newWorkshop: Taller) => void;
};

const CreateWorkshopModal = ({
  visible,
  onClose,
  onWorkshopCreated,
}: CreateWorkshopModalProps) => {
  const [titol, setTitol] = useState("");
  const [sector, setSector] = useState("");
  const [modalitat, setModalitat] = useState("A");
  const [trimestre, setTrimestre] = useState("1r");
  const [descripcio, setDescripcio] = useState("");
  const [duradaHores, setDuradaHores] = useState("");
  const [placesMaximes, setPlacesMaximes] = useState("");
  const [ubicacioDefecte, setUbicacioDefecte] = useState("");
  const [diesExecucio, setDiesExecucio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!titol || !modalitat) {
      setError("El título y la modalidad son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    const newWorkshopData: Omit<Taller, '_id'> = {
      titol,
      sector,
      modalitat,
      trimestre,
      detalls_tecnics: {
        descripcio,
        durada_hores: parseInt(duradaHores, 10) || 0,
        places_maximes: parseInt(placesMaximes, 10) || 0,
        ubicacio_defecte: ubicacioDefecte,
      },
      dies_execucio: diesExecucio.split(",").map((d) => d.trim()),
      referents_assignats: [], // Or undefined, but an empty array is safer
    };

    try {
      const createdTaller = await tallerService.create(newWorkshopData);
      onWorkshopCreated(createdTaller);
      onClose();
    } catch (err: any) {
      setError(err.message || "No se pudo crear el taller. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-[#003B5C]">
                Crear Nuevo Taller
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            {error && (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            )}

            <Text className="text-gray-600 mb-2">Título</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={titol}
              onChangeText={setTitol}
            />

            <Text className="text-gray-600 mb-2">Sector</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={sector}
              onChangeText={setSector}
            />

            <Text className="text-gray-600 mb-2">Modalidad</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={modalitat}
              onChangeText={setModalitat}
            />

            <Text className="text-gray-600 mb-2">Trimestre</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={trimestre}
              onChangeText={setTrimestre}
            />

            <Text className="text-gray-600 mb-2">Descripción</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4 h-24"
              value={descripcio}
              onChangeText={setDescripcio}
              multiline
            />

            <Text className="text-gray-600 mb-2">Duración (horas)</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={duradaHores}
              onChangeText={setDuradaHores}
              keyboardType="numeric"
            />

            <Text className="text-gray-600 mb-2">Plazas Máximas</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={placesMaximes}
              onChangeText={setPlacesMaximes}
              keyboardType="numeric"
            />

            <Text className="text-gray-600 mb-2">Ubicación</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={ubicacioDefecte}
              onChangeText={setUbicacioDefecte}
            />

            <Text className="text-gray-600 mb-2">
              Días de ejecución (separados por coma)
            </Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              value={diesExecucio}
              onChangeText={setDiesExecucio}
            />

            <TouchableOpacity
              className={`p-4 rounded-lg mt-4 ${
                loading ? "bg-gray-400" : "bg-green-500"
              }`}
              onPress={handleCreate}
              disabled={loading}
            >
              <Text className="text-white text-center font-bold">
                {loading ? "Creando..." : "Crear Taller"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CreateWorkshopModal;
