import { View, Text, Modal, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Taller } from '../services/tallerService';

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedWorkshop: Taller | null;
}

export default function WorkshopDetail({ visible, onClose, selectedWorkshop }: Props) {
    const router = useRouter();

    const imageSource = (selectedWorkshop as any)?.imatge 
        ? { uri: (selectedWorkshop as any).imatge } 
        : { uri: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={!!selectedWorkshop && visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-white">
                
                {selectedWorkshop && (
                    <>
                        {/* Botón Cerrar */}
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            className="absolute top-12 right-5 bg-black/30 p-2 rounded-full z-50"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
                            
                            <Image 
                                source={imageSource} 
                                className="w-full h-72 bg-slate-200"
                                resizeMode="cover"
                            />

                            <View className="flex-1 w-full md:max-w-4xl md:mx-auto">
                                <View className="p-6">
                                    <Text className="text-[#00426b] text-3xl font-bold mb-4 leading-tight">
                                        {selectedWorkshop.titol}
                                    </Text>

                                    {/* Etiquetas */}
                                    <View className="flex-row items-center mb-8 flex-wrap gap-2">
                                        <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                            <Text className="text-blue-800 text-xs font-bold uppercase">
                                                {selectedWorkshop.modalitat}
                                            </Text>
                                        </View>
                                        <View className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                            <Text className="text-green-800 text-xs font-bold">
                                                {selectedWorkshop.trimestre} Trimestre
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Contenedor de Información (Sin space-y-8 para control manual) */}
                                    <View>
                                        
                                        {/* 1. Ubicación */}
                                        <View className="flex-row items-start mb-6">
                                            <View className="bg-slate-50 p-3 rounded-xl mr-4 border border-slate-100">
                                                <Ionicons name="location" size={24} color="#00426b" />
                                            </View>
                                            <View className="flex-1 pt-1">
                                                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Ubicación</Text>
                                                <Text className="text-slate-800 text-lg font-medium">
                                                    {selectedWorkshop.detalls_tecnics?.ubicacio_defecte ?? 'No disponible'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* 2. Detalles (Plazas y Referentes) */}
                                        {/* AQUÍ ESTÁ EL ARREGLO: Añadido mb-6 para separarlo de la línea */}
                                        <View className="flex-row items-start mb-6">
                                            <View className="bg-slate-50 p-3 rounded-xl mr-4 border border-slate-100">
                                                <Ionicons name="people" size={24} color="#00426b" />
                                            </View>
                                            <View className="flex-1 pt-1">
                                                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Detalles</Text>
                                                <Text className="text-slate-800 text-lg font-medium">
                                                    {selectedWorkshop.detalls_tecnics?.places_maximes ?? 0} Plazas disponibles
                                                </Text>
                                                {(selectedWorkshop.referents_assignats?.length ?? 0) > 0 && (
                                                    <Text className="text-slate-500 text-sm mt-1 leading-5">
                                                        Referentes: {selectedWorkshop.referents_assignats!.join(', ')}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* 3. Separador */}
                                        <View className="h-[1px] bg-slate-100 w-full" />

                                        {/* 4. Descripción */}
                                        {/* Mantenemos el mt-6 que ya te gustaba */}
                                        <View className="mt-6">
                                            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-3">Descripción del Taller</Text>
                                            <Text className="text-slate-600 text-lg leading-8">
                                                {selectedWorkshop.detalls_tecnics?.descripcio ?? 'No disponible.'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="h-10" />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Fijo */}
                        <View className="bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <View className="w-full md:max-w-4xl md:mx-auto p-5">
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => console.log('Download PDF')}
                                        className="flex-1 bg-white border border-slate-200 flex-row items-center justify-center p-4 rounded-xl active:bg-slate-50"
                                    >
                                        <Ionicons name="download-outline" size={20} color="#00426b" style={{ marginRight: 8 }} />
                                        <Text className="text-[#00426b] font-bold">PDF</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            onClose();
                                            router.push('/form' as any);
                                        }}
                                        className="flex-[2] bg-[#00426b] flex-row items-center justify-center p-4 rounded-xl shadow-lg shadow-blue-900/20 active:bg-[#003355]"
                                    >
                                        <Ionicons name="clipboard-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                        <Text className="text-white font-bold text-lg">Inscribirse</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
}