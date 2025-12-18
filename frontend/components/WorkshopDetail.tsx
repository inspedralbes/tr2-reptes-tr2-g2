import React from "react";
import {View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons} from "@expo/vector-icons";

interface Props { 
    visible: boolean;
    onClose: () => void;
    workshopData: any;
}

export default function WorkshopDetail({ visible, onClose, workshopData }: Props) {
    if (!workshopData) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            >
                {/*Fondo oscuro translúcido*/}
                <View className="flex-1 justify-center items-center bg-black/50 px-6">

                    {/*Tarjeta de detalles (Blanca)*/}
                    <View className="bg-white w-full rounded-3xl p-6 shadow-2xl relative">
                        
                        {/*Boton X para cerrar (Arriba a la derecha*/}
                        <TouchableOpacity
                            onPress={onClose}
                            className="absolute right-4 top-4 z-10 p-2"
                        >
                            <Ionicons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>

                        {/*Cabezera: Titulo y Plazas*/}
                        <View className="mb-4">
                            <Text className="text-2xl font-bold text-slate-800 pr-10">
                                {workshopData.title || "Nombre del Taller"}
                            </Text>
                            <View className="bg-slate-200 self-start px-2 py-1 rounded mt-2">
                                <Text className="text-slate-600 text-xs font-bold">
                                    Plazas: {workshopData.spots || "0/0"}
                                </Text>
                            </View>
                        </View>
                        {/* ScrollView para la descripcion mas larga */}
                        <ScrollView className="max-h-80 mb-6">
                            <Text className="text-slate-600 text-base leading-6 mb-4">
                                {workshopData.description || "Aqui va la descripcion del taller..."}
                            </Text>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-slate-800 font-semibold mb-1">Profesores Referentes:</Text>
                                    <Text className="text-slate-500">{workshopData.teachers || "No asignado"}</Text>
                                </View>
                                
                                <View>
                                    <Text className="text-slate-800 font-semibold mb-1">Días y Horarios:</Text>
                                    <Text className="text-slate-500">{workshopData.startDate || "TBD"}</Text>
                                </View>
                                <View>
                                    <Text className="text-slate-800 font-semibold mb-1">Ubicación:</Text>
                                    <Text className="text-slate-500">{workshopData.location || "Aula por definir"}</Text>
                                </View>
                            </View>
                        </ScrollView>
                        
                    </View>
                </View>
        </Modal>
    );
}