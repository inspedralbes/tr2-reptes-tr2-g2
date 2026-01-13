import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import alumneService, { Alumne } from '../services/alumneService';

// 1. Actualizamos el tipo para incluir 'centro'
type SortField = 'nombre' | 'estado' | 'centro' | null;
type SortOrder = 'asc' | 'desc' | null;

const getStatusColor = (estado: string) => {
    switch (estado) {
        case 'Aprobado': return 'bg-green-100 text-green-800 border-green-200';
        case 'En proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const UserRow = ({ item }: { item: Alumne }) => (
    <View className="flex-row items-center border-b border-gray-100 py-4 px-2 bg-white" style={{ minWidth: 800 }}>
        <View className="w-16 items-center justify-center">
            <Image source={{ uri: item.imagen }} className="h-10 w-10 rounded-full border border-gray-100" />
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="font-semibold text-gray-900 text-[15px]" numberOfLines={1}>
                {item.nombre}, {item.apellido}
            </Text>
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="text-gray-600 text-sm" numberOfLines={1}>{item.centro}</Text>
        </View>

        <View className="flex-[1.5] px-2">
            <Text className="text-gray-700 text-xs font-medium" numberOfLines={1}>{item.email}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.telefono}</Text>
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
                <Text className="text-[11px] font-bold uppercase" numberOfLines={1}>
                    {item.estado || 'DESCONOCIDO'}
                </Text>
            </View>
        </View>
    </View>
);

const TableHeader = ({ 
    sortField, 
    sortOrder, 
    onSort 
}: { 
    sortField: SortField, 
    sortOrder: SortOrder, 
    onSort: (field: SortField) => void 
}) => {
    
    const renderSortIndicator = (field: SortField) => {
        if (sortField !== field) return ' ↕';
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <View className="flex-row items-center bg-gray-50 border-y border-gray-200 py-3 px-2" style={{ minWidth: 800 }}>
            <View className="w-16 items-center">
                <Text className="font-bold text-gray-400 text-[11px] tracking-wider">IMG</Text>
            </View>
            
            {/* Filtro Alumno */}
            <TouchableOpacity className="flex-[1.5] px-2 flex-row items-center" onPress={() => onSort('nombre')}>
                <Text className="font-bold text-gray-400 text-[11px] tracking-wider">ALUMNO</Text>
                <Text className="text-blue-500 font-bold">{renderSortIndicator('nombre')}</Text>
            </TouchableOpacity>

            {/* 2. Filtro Centro (Nuevo) */}
            <TouchableOpacity className="flex-[1.5] px-2 flex-row items-center" onPress={() => onSort('centro')}>
                <Text className="font-bold text-gray-400 text-[11px] tracking-wider">CENTRO</Text>
                <Text className="text-blue-500 font-bold">{renderSortIndicator('centro')}</Text>
            </TouchableOpacity>

            <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">CONTACTO</Text></View>
            <View className="flex-[2] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">TALLERES</Text></View>
            
            {/* Filtro Estado */}
            <TouchableOpacity className="flex-1 px-2 flex-row items-center" onPress={() => onSort('estado')}>
                <Text className="font-bold text-gray-400 text-[11px] tracking-wider">ESTADO</Text>
                <Text className="text-blue-500 font-bold">{renderSortIndicator('estado')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function UserTable() {
    const [users, setUsers] = useState<Alumne[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortOrder === 'asc') setSortOrder('desc');
            else if (sortOrder === 'desc') {
                setSortOrder(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // 3. La lógica de sortedUsers ya es dinámica, funcionará con 'centro' automáticamente
    const sortedUsers = useMemo(() => {
        if (!sortField || !sortOrder) return users;

        return [...users].sort((a, b) => {
            const valA = (a[sortField] || '').toString().toLowerCase();
            const valB = (b[sortField] || '').toString().toLowerCase();

            if (sortOrder === 'asc') return valA.localeCompare(valB);
            return valB.localeCompare(valA);
        });
    }, [users, sortField, sortOrder]);

    if (loading) return (
        <View className="flex-1 justify-center items-center h-40">
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
    );

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-1 bg-white rounded-xl border border-gray-200 my-2">
                <TableHeader 
                    sortField={sortField} 
                    sortOrder={sortOrder} 
                    onSort={handleSort} 
                />
                
                <FlatList
                    data={sortedUsers}
                    renderItem={({ item }) => <UserRow item={item} />}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={
                        <View className="py-10 items-center">
                            <Text className="text-gray-400">No se encontraron alumnos</Text>
                        </View>
                    }
                />
            </View>
        </ScrollView>
    );
}