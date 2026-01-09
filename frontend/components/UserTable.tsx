import React from 'react';
import { View, Text, FlatList, Image, ScrollView } from 'react-native';

// <-- CONFIGURACIÓN DE ANCHOS COLUMNA (Toca solo aquí para cambiar el tamaño usando multiplos de 4)
const COLUMN_WIDTHS = {
    foto: 'w-28',      // 96px
    apellidos: 'w-60', // 240px
    nombre: 'w-44',    // 176px
    centro: 'w-72',    // 288px
    email: 'w-64',     // 256px 
    estado: 'w-40',    // 160px
};

interface User {
    id: string;
    nombre: string;
    apellido: string;
    centro: string;
    email: string;
    imagen: string;
    estado: 'Aprobado' | 'En proceso' | 'Rechazado';
}

const MOCK_USERS: User[] = [
    { id: '1', nombre: 'Ana', apellido: 'García Melich', centro: 'Institut Pedralbes', email: 'ana.garcia@gmail.com', imagen: 'https://i.pravatar.cc/150?u=ana', estado: 'Aprobado' },
    { id: '2', nombre: 'Carlos', apellido: 'López Quintana', centro: 'Institut Tecnològic', email: 'carlos.lopez@gmail.com', imagen: 'https://i.pravatar.cc/150?u=carlos', estado: 'En proceso' },
    { id: '3', nombre: 'Maria', apellido: 'Rodriguez Soler', centro: 'Centre d\'Estudis', email: 'maria.rod@gmail.com', imagen: 'https://i.pravatar.cc/150?u=maria', estado: 'Rechazado' },
    { id: '4', nombre: 'Javier', apellido: 'Martínez Ruiz', centro: 'Escola Pia', email: 'javi.martinez@gmail.com', imagen: 'https://i.pravatar.cc/150?u=javier', estado: 'Aprobado' },
    { id: '5', nombre: 'Lucía', apellido: 'Fernández Samsó', centro: 'Institut Pedralbes', email: 'lucia.fer@gmail.com', imagen: 'https://i.pravatar.cc/150?u=lucia', estado: 'En proceso' },
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
        <View className="flex-row items-center border-b border-gray-200 bg-white">
            <View className={`${COLUMN_WIDTHS.foto} items-center border-r border-gray-200 py-3`}>
                <Image source={{ uri: item.imagen }} className="h-11 w-11 rounded-full border border-gray-200" />
            </View>
            <View className={`${COLUMN_WIDTHS.apellidos} px-4 border-r border-gray-200 h-full justify-center`}>
                <Text className="text-gray-900 text-[14px]">{item.apellido}</Text>
            </View>
            <View className={`${COLUMN_WIDTHS.nombre} px-4 border-r border-gray-200 h-full justify-center`}>
                <Text className="text-gray-700 text-[14px]">{item.nombre}</Text>
            </View>
            <View className={`${COLUMN_WIDTHS.centro} px-4 border-r border-gray-200 h-full justify-center`}>
                <Text className="text-gray-800 text-[13px] font-bold italic">{item.centro}</Text>
            </View>
            <View className={`${COLUMN_WIDTHS.email} px-4 border-r border-gray-200 h-full justify-center`}>
                <Text className="text-blue-600 text-[13px] font-medium" numberOfLines={1}>{item.email}</Text>
            </View>
            <View className={`${COLUMN_WIDTHS.estado} px-5 justify-center items-center`}>
                <View className={`px-2 py-1.5 rounded border ${status.bg} ${status.border} w-full`}>
                    <Text className={`text-[10px] font-bold uppercase text-center ${status.text}`}>{item.estado}</Text>
                </View>
            </View>
        </View>
    );
};

export default function UserTable() {
    return (
        <View className="flex-1 bg-white">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                    {/* HEADER */}
                    <View className="flex-row bg-gray-100 border-b-2 border-gray-400">
                        <View className={`${COLUMN_WIDTHS.foto} py-5 border-r border-gray-300 items-center`}>
                            <Text className="text-[11px] font-black text-black uppercase">Foto</Text>
                        </View>
                        <View className={`${COLUMN_WIDTHS.apellidos} py-5 px-4 border-r border-gray-300`}>
                            <Text className="text-[11px] font-black text-black uppercase">Apellidos</Text>
                        </View>
                        <View className={`${COLUMN_WIDTHS.nombre} py-5 px-4 border-r border-gray-300`}>
                            <Text className="text-[11px] font-black text-black uppercase">Nombre</Text>
                        </View>
                        <View className={`${COLUMN_WIDTHS.centro} py-5 px-4 border-r border-gray-300`}>
                            <Text className="text-[11px] font-black text-black uppercase">Centro</Text>
                        </View>
                        <View className={`${COLUMN_WIDTHS.email} py-5 px-4 border-r border-gray-300`}>
                            <Text className="text-[11px] font-black text-black uppercase">Email</Text>
                        </View>
                        <View className={`${COLUMN_WIDTHS.estado} py-5 px-4 items-center`}>
                            <Text className="text-[11px] font-black text-black uppercase">Estado</Text>
                        </View>
                    </View>

                    {/* LISTA */}
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