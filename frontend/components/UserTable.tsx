import React from 'react';
import { View, Text, FlatList, Image, ScrollView } from 'react-native';

interface User {
    id: string;
    nombre: string;
    apellido: string;
    centro: string;
    email: string;
    telefono: string;
    imagen: string;
    estado: 'Aprobado' | 'En proceso' | 'Rechazado';
}

const MOCK_USERS: User[] = [
    { id: '1', nombre: 'Ana', apellido: 'García Melich', centro: 'Institut Pedralbes', email: 'ana.garcia@gmail.com', telefono: '612 345 678', imagen: 'https://i.pravatar.cc/150?u=ana', estado: 'Aprobado' },
    { id: '2', nombre: 'Carlos', apellido: 'López Quintana', centro: 'Institut Tecnològic', email: 'carlos.lopez@gmail.com', telefono: '698 765 432', imagen: 'https://i.pravatar.cc/150?u=carlos', estado: 'En proceso' },
    { id: '3', nombre: 'Maria', apellido: 'Rodriguez Soler', centro: 'Centre d\'Estudis', email: 'maria.rod@gmail.com', telefono: '655 443 322', imagen: 'https://i.pravatar.cc/150?u=maria', estado: 'Rechazado' },
    { id: '4', nombre: 'Javier', apellido: 'Martínez Ruiz', centro: 'Escola Pia', email: 'javi.martinez@gmail.com', telefono: '666 777 888', imagen: 'https://i.pravatar.cc/150?u=javier', estado: 'Aprobado' },
    { id: '5', nombre: 'Lucía', apellido: 'Fernández Samsó', centro: 'Institut Pedralbes', email: 'lucia.fer@gmail.com', telefono: '611 222 333', imagen: 'https://i.pravatar.cc/150?u=lucia', estado: 'En proceso' },
];

const getStatusBadge = (estado: string) => {
    switch (estado) {
        case 'Aprobado': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
        case 'En proceso': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        case 'Rechazado': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
};

const UserRow = ({ item }: { item: User }) => {
    const status = getStatusBadge(item.estado);
    return (
        <View className="flex-row items-center border-b border-gray-100 bg-white min-h-[64px]">
            {/* 1. Imagen */}
            <View className="w-20 items-center border-r border-gray-100 h-full justify-center">
                <Image source={{ uri: item.imagen }} className="h-10 w-10 rounded-full border border-gray-200" />
            </View>
            
            {/* 2. Apellidos */}
            <View className="w-52 px-4 border-r border-gray-100 h-full justify-center">
                <Text className="text-gray-900 text-[14px]">{item.apellido}</Text>
            </View>

            {/* 3. Nombre */}
            <View className="w-40 px-4 border-r border-gray-100 h-full justify-center">
                <Text className="text-gray-700 text-[14px]">{item.nombre}</Text>
            </View>

            {/* 4. Centro */}
            <View className="w-56 px-4 border-r border-gray-100 h-full justify-center">
                <Text className="text-gray-500 text-[13px]">{item.centro}</Text>
            </View>

            {/* 5. Email */}
            <View className="w-64 px-4 border-r border-gray-100 h-full justify-center">
                <Text className="text-blue-600 text-[13px] font-medium" numberOfLines={1}>{item.email}</Text>
            </View>

            {/* 6. Teléfono */}
            <View className="w-36 px-4 border-r border-gray-100 h-full justify-center">
                <Text className="text-gray-600 text-[13px]">{item.telefono}</Text>
            </View>

            {/* 7. Estado */}
            <View className="w-40 px-4 h-full justify-center items-center">
                <View className={`px-3 py-1 rounded border ${status.bg} ${status.border} w-full`}>
                    <Text className={`text-[10px] font-bold uppercase text-center ${status.text}`}>
                        {item.estado}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const TableHeader = () => (
    <View className="flex-row items-center bg-gray-100 border-b-2 border-gray-300">
        <View className="w-20 py-4 items-center border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Foto</Text>
        </View>
        <View className="w-52 py-4 px-4 border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Apellidos</Text>
        </View>
        <View className="w-40 py-4 px-4 border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Nombre</Text>
        </View>
        <View className="w-56 py-4 px-4 border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Centro</Text>
        </View>
        <View className="w-64 py-4 px-4 border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Email</Text>
        </View>
        <View className="w-36 py-4 px-4 border-r border-gray-200">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Teléfono</Text>
        </View>
        <View className="w-40 py-4 px-4 items-center">
            <Text className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Estado</Text>
        </View>
    </View>
);

export default function UserTable() {
    return (
        <View className="flex-1 bg-white">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View className="min-w-full">
                    <TableHeader />
                    <FlatList
                        data={MOCK_USERS}
                        renderItem={({ item }) => <UserRow item={item} />}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
}