import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import alumneService, { Alumne } from '../services/alumneService';

type SortField = 'nombre' | 'estado' | 'centro' | null;
type SortOrder = 'asc' | 'desc' | null;

const getStatusColor = (estado: string) => {
    switch (estado) {
        case 'Aprobado':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'En proceso':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Rechazado':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const UserRow = ({ item }: { item: Alumne }) => (
    <View className="flex-row items-center border-b border-gray-100 py-4 px-2 hover:bg-gray-50 bg-white" style={{ minWidth: 600 }}>

        {/* Imagen */}
        <View className="w-16 items-center justify-center">
            <Image
                source={{ uri: item.imagen }}
                className="h-10 w-10 rounded-full border border-gray-100"
            />
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="font-semibold text-gray-900 text-[15px]" numberOfLines={1}>
                {item.apellido}, {item.nombre}
            </Text>
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="text-primary/75 text-sm" numberOfLines={1}>{item.centro}</Text>
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="text-primary text-xs font-medium" numberOfLines={1}>{item.email}</Text>
            <Text className="text-primary/50 text-xs mt-0.5">{item.telefono}</Text>
        </View>

        <View className="flex-[2] px-2 flex-row flex-wrap gap-1">
            {item.talleres && item.talleres.length > 0 ? (
                item.talleres.map((taller, index) => (
                    <View key={index} className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-blue-700 text-[10px] font-medium uppercase">{taller}</Text>
                    </View>
                ))
            ) : (
                <Text className="text-gray-300 text-[10px] italic">Sin talleres</Text>
            )}
        </View>

        <View className="flex-1 px-2 items-start">
            <View className={`px-2 py-1 rounded-full border ${getStatusColor(item.estado)}`}>
                <Text className={`text-[11px] font-bold ${getStatusColor(item.estado).split(' ')[1]}`} numberOfLines={1}>
                    {item.estado ? item.estado.toUpperCase() : 'DESCONOCIDO'}
                </Text>
            </View>
        </View>
    </View>
);

const TableHeader = () => (
    <View className="flex-row items-center bg-gray-50 border-y border-gray-200 py-3 px-2" style={{ minWidth: 600 }}>
        <View className="w-16 items-center"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">IMG</Text></View>
        <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">ALUMNO</Text></View>
        <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">CENTRO</Text></View>
        <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">CONTACTO</Text></View>
        <View className="flex-1 px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">ESTADO</Text></View>
    </View>
);

export default function UserTable() {
    const [users, setUsers] = useState<Alumne[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(''); // Estado para el buscador
    
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await alumneService.getAll();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10, color: '#666' }}>Carregant Estudiants...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200, paddingHorizontal: 16 }}>
                <Text style={{ color: '#ef4444', textAlign: 'center' }}>Error: {error}</Text>
            </View>
        );
    }

    if (!users || users.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Text style={{ color: '#999' }}>No students found</Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginVertical: 8 }}>
                <TableHeader />
                <FlatList
                    data={users}
                    renderItem={({ item }) => <UserRow item={item} />}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </ScrollView>
    );
}