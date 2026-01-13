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
            <View className="flex-1 ">
                
                {selectedWorkshop && (
                    <>
                        {/* Botón Cerrar */}
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            className="absolute top-12 right-5 bg-black/30 p-2 z-50"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
                            
                            <Image 
                                source={imageSource} 
                                className="w-full h-72 bg-light-gray"
                                resizeMode="cover"
                            />

                            <View className="flex-1 w-full md:max-w-4xl md:mx-auto">
                                <View className="p-6">
                                    <Text className="text-primary text-3xl font-bold mb-4 leading-tight">
                                        {selectedWorkshop.titol}
                                    </Text>

                                    {/* Etiquetas */}
                                    <View className="flex-row items-center mb-8 flex-wrap gap-2">
                                        <View className="bg-primary/10 px-3 py-1 border border-primary/20">
                                            <Text className="text-primary text-xs font-bold uppercase">
                                                {selectedWorkshop.modalitat}
                                            </Text>
                                        </View>
                                        <View className="bg-light-blue/10 px-3 py-1 border border-light-blue/20">
                                            <Text className="text-light-blue text-xs font-bold">
                                                {selectedWorkshop.trimestre} Trimestre
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Contenedor de Información (Sin space-y-8 para control manual) */}
                                    <View>
                                        
                                        {/* 1. Ubicación */}
                                        <View className="flex-row items-start mb-6">
                                            <View className="bg-light-gray/20 p-3 mr-4 border border-light-gray">
                                                <Ionicons name="location" size={24} color="#00426b" />
                                            </View>
                                            <View className="flex-1 pt-1">
                                                <Text className="text-primary/50 font-bold text-[10px] uppercase tracking-wider mb-1">Ubicación</Text>
                                                <Text className="text-primary text-lg font-medium">
                                                    {selectedWorkshop.detalls_tecnics?.ubicacio_defecte ?? 'No disponible'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* 2. Detalles (Plazas y Referentes) */}
                                        {/* AQUÍ ESTÁ EL ARREGLO: Añadido mb-6 para separarlo de la línea */}
                                        <View className="flex-row items-start mb-6">
                                            <View className="bg-light-gray/20 p-3 mr-4 border border-light-gray">
                                                <Ionicons name="people" size={24} color="#00426b" />
                                            </View>
                                            <View className="flex-1 pt-1">
                                                <Text className="text-primary/50 font-bold text-[10px] uppercase tracking-wider mb-1">Detalles</Text>
                                                <Text className="text-primary text-lg font-medium">
                                                    {selectedWorkshop.detalls_tecnics?.places_maximes ?? 0} Plazas disponibles
                                                </Text>
                                                {(selectedWorkshop.referents_assignats?.length ?? 0) > 0 && (
                                                    <Text className="text-primary/75 text-sm mt-1 leading-5">
                                                        Referentes: {selectedWorkshop.referents_assignats!.join(', ')}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* 3. Separador */}
                                        <View className="h-[1px] bg-light-gray w-full" />

                                        {/* 4. Descripción */}
                                        {/* Mantenemos el mt-6 que ya te gustaba */}
                                        <View className="mt-6">
                                            <Text className="text-primary/50 font-bold text-[10px] uppercase tracking-wider mb-3">Descripción del Taller</Text>
                                            <Text className="text-primary/90 text-lg leading-8">
                                                {selectedWorkshop.detalls_tecnics?.descripcio ?? 'No disponible.'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="h-10" />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Fijo */}
                        <View className=" border-t border-light-gray">
                            <View className="w-full md:max-w-4xl md:mx-auto p-5">
                                <View className="flex-row gap-3">
                                                                         <TouchableOpacity
                                                                            onPress={() => console.log('Download PDF')}
                                                                            className="flex-1  border border-light-gray flex-row items-center justify-center p-4 active:bg-light-gray/20"
                                                                        >
                                                                            <Ionicons name="download-outline" size={20} color="#00426b" style={{ marginRight: 8 }} />
                                                                            <Text className="text-primary font-bold">PDF</Text>
                                                                        </TouchableOpacity>
                                                                         <TouchableOpacity
                                                                            onPress={() => {
                                                                                onClose();
                                                                                router.push('/statistics' as any);
                                                                            }}
                                                                            className="flex-[2] bg-primary flex-row items-center justify-center p-4"
                                                                        >
                                                                            <Ionicons name="clipboard-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                                                            <Text className="text-white font-bold text-lg">Inscribirse</Text>
                                                                        </TouchableOpacity>                                </View>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
}