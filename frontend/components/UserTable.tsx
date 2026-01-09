import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native';

interface User {
    _id: string; // MongoDB uses _id
    nombre: string;
    apellido: string;
    centro: string;
    email: string;
    telefono: string;
    imagen: string;
    estado: 'Aprobado' | 'En proceso' | 'Rechazado';
}

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

const UserRow = ({ item }: { item: User }) => (
    <View className="flex-row items-center border-b border-gray-100 py-4 px-2 hover:bg-gray-50 bg-white">

        {/* Imagen */}
        <View className="w-16 items-center justify-center">
            <Image
                source={{ uri: item.imagen }}
                className="h-10 w-10 rounded-full border border-gray-100"
            />
        </View>

        {/* Nombre y Apellido */}
        <View className="flex-[1.5] px-2">
            <Text className="font-semibold text-gray-900 text-[15px]">{item.apellido}, {item.nombre}</Text>
        </View>

        {/* Centro */}
        <View className="flex-[1.5] px-2 hidden md:flex">
            <Text className="text-gray-600 text-sm">{item.centro}</Text>
        </View>

        {/* Contacto (Email/Tel) */}
        <View className="flex-[1.5] px-2">
            <Text className="text-gray-700 text-xs font-medium" numberOfLines={1}>{item.email}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.telefono}</Text>
        </View>

        {/* Estado */}
        <View className="flex-1 px-2 items-start">
            <View className={`px-2.5 py-1 rounded-full border ${getStatusColor(item.estado)}`}>
                <Text className={`text-[11px] font-bold ${getStatusColor(item.estado).split(' ')[1]}`}>
                    {item.estado ? item.estado.toUpperCase() : 'DESCONOCIDO'}
                </Text>
            </View>
        </View>
    </View>
);

const TableHeader = () => (
    <View className="flex-row items-center bg-gray-50 border-y border-gray-200 py-3 px-2">
        <View className="w-16 items-center"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">IMG</Text></View>
        <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">ALUMNO</Text></View>
        <View className="flex-[1.5] px-2 hidden md:flex"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">CENTRO</Text></View>
        <View className="flex-[1.5] px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">CONTACTO</Text></View>
        <View className="flex-1 px-2"><Text className="font-bold text-gray-400 text-[11px] tracking-wider">ESTADO</Text></View>
    </View>
);

export default function ListadoUsuarios() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Ensure the URL matches your backend configuration
                const response = await fetch('http://localhost:3000/api/alumnes');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center h-40">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-2 my-2">
            <TableHeader />
            <FlatList
                data={users}
                renderItem={({ item }) => <UserRow item={item} />}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}
