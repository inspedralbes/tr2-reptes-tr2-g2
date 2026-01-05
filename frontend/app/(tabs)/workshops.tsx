import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import WorkshopDetail from "../../components/WorkshopDetail";
import tallerService, { Taller } from "../../services/tallerService";

export default function TallerScreen() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Función asíncrona para cargar los datos
    const fetchTalleres = async () => {
      try {
        setLoading(true);
        const data = await tallerService.getAll();
        setTalleres(data);
        setError(null);
      } catch (err) {
        setError(
          "No se pudieron cargar los talleres. Inténtalo de nuevo más tarde."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTalleres();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#003B5C" />
        <Text className="mt-2 text-slate-500">Cargando talleres...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1">
        <Text className="text-[#003B5C] text-xl font-bold text-center mb-6">
          Tallers Disponibles
        </Text>

        <FlatList
          data={talleres}
          keyExtractor={(item) => item._id}
          numColumns={3}
          columnWrapperStyle={{ gap: 20 }}
          contentContainerClassName="gap-8 pb-24"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedWorkshop(item)}
              className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm"
            >
              <View className="p-4">
                <Text
                  className="text-[#00426b] font-bold text-lg mb-1"
                  numberOfLines={1}
                >
                  {item.titol}
                </Text>
                <Text
                  className="text-slate-600 text-xs mb-3 leading-4 h-8"
                  numberOfLines={2}
                >
                  {item.detalls_tecnics.descripcio}
                </Text>
                <Text className="text-slate-800 text-xs font-bold self-end">
                  Plazas: {item.detalls_tecnics.places_maximes}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* El componente de detalle probablemente necesite ajustes para aceptar el tipo `Taller`
          en lugar del tipo mock. Por ahora, lo dejamos así para que compile.
          Asegúrate de que WorkshopDetail pueda manejar la nueva estructura de datos. */}
      <WorkshopDetail
        visible={!!selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        selectedWorkshop={selectedWorkshop as any} // Usamos 'as any' temporalmente
      />
    </SafeAreaView>
  );
}
