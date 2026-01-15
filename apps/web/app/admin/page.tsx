"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import WorkshopDetail from "../../components/WorkshopDetail";
import WorkshopCard from "../../components/WorkshopCard";
import tallerService, { Taller } from "../../services/tallerService";
import WorkshopActions from "../../components/WorkshopActions";
import CreateWorkshopModal from "../../components/CreateWorkshopModal";

export default function TallerScreen() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Taller | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const fetchTalleres = useCallback(async () => {
    try {
      const listaTalleres = await tallerService.getAll();
      setTalleres(listaTalleres);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los talleres.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTalleres().finally(() => setLoading(false));
  }, [fetchTalleres]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTalleres();
    setRefreshing(false);
  }, [fetchTalleres]);

  const filteredTalleres = useMemo(() => {
    if (!searchQuery) {
      return talleres;
    }
    return talleres.filter((taller) =>
      taller.titol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [talleres, searchQuery]);

  const handleWorkshopSaved = (savedWorkshop: Taller) => {
    setTalleres((prev) => {
      const exists = prev.find((t) => t._id === savedWorkshop._id);
      if (exists) {
        return prev.map((t) => (t._id === savedWorkshop._id ? savedWorkshop : t));
      }
      return [savedWorkshop, ...prev];
    });
    setEditingWorkshop(null);
  };

  const handleEdit = (taller: Taller) => {
    setEditingWorkshop(taller);
    setSelectedWorkshop(null); // Close detail view
    setCreateModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await tallerService.delete(id);
      setTalleres((prev) => prev.filter((t) => t._id !== id));
      setSelectedWorkshop(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el taller");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Carregant Tallers...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
        {filteredTalleres.map((taller) => (
          <WorkshopCard
            key={taller._id}
            item={taller}
            onPress={() => setSelectedWorkshop(taller)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-blue-600 text-2xl font-bold text-center mb-6">
          Tallers Disponibles
        </h1>

        <WorkshopActions
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onFilterPress={() => console.log("Filter pressed")}
          onCreatePress={() => {
            setEditingWorkshop(null);
            setCreateModalVisible(true);
          }}
        />

        {renderContent()}
      </div>

      <WorkshopDetail
        visible={!!selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        selectedWorkshop={selectedWorkshop}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateWorkshopModal
        visible={isCreateModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingWorkshop(null);
        }}
        onWorkshopCreated={handleWorkshopSaved}
        initialData={editingWorkshop}
      />
    </div>
  );
}