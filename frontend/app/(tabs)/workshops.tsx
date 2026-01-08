import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
// Asegúrate de que estas rutas sean correctas
import WorkshopDetail from "../../components/WorkshopDetail";
import WorkshopCard from "../../components/WorkshopCard";
import tallerService, { Taller } from "../../services/tallerService";

export default function TallerScreen() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        setLoading(true);
        const listaTalleres = await tallerService.getAll();
        setTalleres(listaTalleres);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar los talleres.");
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
        <Text className="mt-4 text-slate-500">Cargando talleres...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-red-500 text-center text-lg mb-2">⚠️ Error</Text>
        <Text className="text-slate-600 text-center">{error}</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (Platform.OS === 'web') {
      return (
        <ScrollView contentContainerClassName="p-4">
          <View className="flex-row flex-wrap -mx-2">
            {talleres.map((taller) => (
              <View key={taller._id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
                <WorkshopCard
                  item={taller}
                  onPress={() => setSelectedWorkshop(taller)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={talleres}
        keyExtractor={(item) => item._id || Math.random().toString()}
        numColumns={1}
        contentContainerClassName="gap-4 pb-24"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-slate-400 text-lg">No hay talleres para mostrar</Text>
            <Text className="text-slate-300 text-sm">Revisa la conexión con la API</Text>
          </View>
        }
        renderItem={({ item }) => (
          <WorkshopCard
            item={item}
            onPress={() => setSelectedWorkshop(item)}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-4">
        <Text className="text-[#003B5C] text-2xl font-bold text-center mb-6 mt-2">
          Tallers Disponibles
        </Text>

        {renderContent()}
      </View>

      {/* Modal de Detalle */}
      {selectedWorkshop && (
        <WorkshopDetail
          visible={!!selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
          // @ts-ignore
          selectedWorkshop={selectedWorkshop}
        />
      )}
    </SafeAreaView>
  );
}