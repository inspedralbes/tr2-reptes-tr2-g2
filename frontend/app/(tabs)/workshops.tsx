import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import WorkshopDetail from "../../components/WorkshopDetail";
import WorkshopCard from "../../components/WorkshopCard";
import tallerService, { Taller } from "../../services/tallerService";

export default function TallerScreen() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();

  const fetchTalleres = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const listaTalleres = await tallerService.getAll();
      setTalleres(listaTalleres);
    } catch (err) {
      setError("No se pudieron cargar los talleres.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTalleres(false);
  }, [fetchTalleres]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTalleres(true);
  }, [fetchTalleres]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#003B5C" />
        <Text className="mt-4 text-slate-500 font-medium">Cargando experiencias...</Text>
      </View>
    );
  }

  const renderContent = () => {
    // WEB
    if (Platform.OS === 'web') {
      return (
        <ScrollView contentContainerClassName="p-6">
          <View className="flex-row flex-wrap -mx-4">
            {talleres?.map((taller) => (
              <View key={taller._id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8">
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

    // MÓVIL
    return (
      <FlatList
        data={talleres}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerClassName="px-5 pb-24"
        contentContainerStyle={{ paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#003B5C" 
            progressViewOffset={insets.top}
          />
        }
        ListEmptyComponent={
          (!loading && !error) ? (
            <View className="mt-20 items-center px-10">
              <Text className="text-slate-400 text-lg text-center font-medium">
                No hay talleres disponibles en este momento.
              </Text>
            </View>
          ) : null
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
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1">
        {error ? (
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-red-500 text-center text-lg mb-4 font-bold">Ocurrió un error</Text>
            <Text className="text-slate-600 text-center mb-6">{error}</Text>
            <TouchableOpacity onPress={() => fetchTalleres(false)} className="bg-[#003B5C] px-6 py-3 rounded-full">
                <Text className="text-white font-bold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderContent()
        )}
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
    </View>
  );
}