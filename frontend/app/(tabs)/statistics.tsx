import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Stack } from 'expo-router';

// Mock Data
const SUMMARY_CARDS = [
    { label: 'Assignats', value: 2 },
    { label: 'Sol·licitats', value: 5 },
    { label: 'Pendents de\nDocumentar', value: 3 },
];

const WORKSHOP_DATA = [
    { id: '1', workshop: 'Mecànica bàsica bicicleta', status: 'Assignat', assignation: 'Dijous 9-12h (06/05/2025)' },
    { id: '2', workshop: 'Mecànica bàsica bicicleta', status: "Pendent d'assignació", assignation: 'Dijous 9-12h (06/05/2025)' },
    { id: '3', workshop: 'Jardineria Urbana', status: "Llista d'espera", assignation: 'Dijous 9-12h (06/05/2025)' },
    // Adding random ones
    { id: '4', workshop: 'Cuina de mercat', status: 'Assignat', assignation: 'Dilluns 10-13h (15/05/2025)' },
    { id: '5', workshop: 'Fusteria creativa', status: "Pendent d'assignació", assignation: 'Divendres 16-19h (20/05/2025)' },
];

export default function StatisticsPage() {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Assignat':
                return 'bg-gray-400';
            case "Pendent d'assignació":
            case "Llista d'espera":
                return 'bg-gray-300';
            default:
                return 'bg-gray-200';
        }
    };

    const renderItem = ({ item }: { item: typeof WORKSHOP_DATA[0] }) => (
        <View className="flex-row items-center border-b border-gray-200 py-4 bg-white px-4">
            <View className="flex-[2]">
                <Text className="text-slate-700 font-medium">{item.workshop}</Text>
            </View>
            <View className="flex-[1.5]">
                <View className={`${getStatusStyle(item.status)} px-2 py-1 self-start`}>
                    <Text className="text-slate-700 text-xs font-medium">{item.status}</Text>
                </View>
            </View>
            <View className="flex-[2]">
                <Text className="text-slate-600 text-xs">{item.assignation}</Text>
            </View>
            <View className="flex-[1.5] items-end">
                <TouchableOpacity className="border border-gray-300 px-3 py-1 bg-white">
                    <Text className="text-slate-500 text-xs">Gestionar Documents</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 p-6">
            {/* Page Title */}
            <Text className="text-[#00426B] text-xl font-medium mb-6">
                Dashboard - Estat de les Peticions
            </Text>

            {/* Summary Cards */}
            <View className="flex-row justify-between mb-8 space-x-4">
                {SUMMARY_CARDS.map((card, index) => (
                    <View key={index} className="flex-1 bg-white p-6 items-center justify-center shadow-sm border border-gray-100">
                        <Text className="text-[#00426B] text-4xl font-light mb-1">{card.value}</Text>
                        <Text className="text-slate-600 text-center leading-4">{card.label}</Text>
                    </View>
                ))}
            </View>

            {/* Table Header */}
            <View className="bg-gray-100 flex-row px-4 py-3 border-b border-gray-300">
                <Text className="flex-[2] text-xs font-bold text-slate-600 uppercase">Taller</Text>
                <Text className="flex-[1.5] text-xs font-bold text-slate-600 uppercase">Estat</Text>
                <Text className="flex-[2] text-xs font-bold text-slate-600 uppercase">Assignació</Text>
                <Text className="flex-[1.5] text-xs font-bold text-slate-600 uppercase text-right">Accions</Text>
            </View>

            {/* Table Content */}
            <FlatList
                data={WORKSHOP_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}
