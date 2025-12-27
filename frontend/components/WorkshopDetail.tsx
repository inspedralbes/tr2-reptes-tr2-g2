import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
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
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedWorkshop && visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white h-full overflow-hidden">
                    {selectedWorkshop && (
                        <ScrollView className="flex-1">
                            <View className="p-6 pt-8">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full z-10"
                                >
                                    <Ionicons name="close" size={24} color="#334155" />
                                </TouchableOpacity>

                                <Text className="text-[#00426b] text-3xl font-bold mb-4 pr-10">{selectedWorkshop.titol}</Text>

                                <View className="flex-row items-center mb-6 flex-wrap">
                                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3 mb-2">
                                        {/* CORREGIDO: Añadido optional chaining (?.) y valor por defecto (??) */}
                                        <Text className="text-blue-800 font-bold">
                                            {selectedWorkshop.detalls_tecnics?.places_maximes ?? 0} Plazas
                                        </Text>
                                    </View>
                                    <View className="bg-green-100 px-3 py-1 rounded-full mb-2">
                                        <Text className="text-green-800 font-bold">{selectedWorkshop.trimestre} Trimestre</Text>
                                    </View>
                                </View>

                                <View className="space-y-4">
                                    <View className="flex-row items-start">
                                        <Ionicons name="location-outline" size={24} color="#00426b" style={{ marginRight: 10, top: 4 }} />
                                        <View>
                                            <Text className="text-slate-500 font-bold text-xs uppercase">Ubicación</Text>
                                            {/* CORREGIDO: Añadido optional chaining (?.) y valor por defecto (??) */}
                                            <Text className="text-slate-800 text-lg">
                                                {selectedWorkshop.detalls_tecnics?.ubicacio_defecte ?? 'No disponible'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-start">
                                        <Ionicons name="people-outline" size={24} color="#00426b" style={{ marginRight: 10, top: 4 }} />
                                        <View>
                                            <Text className="text-slate-500 font-bold text-xs uppercase">Referentes</Text>
                                            <Text className="text-slate-800 text-lg">
                                                {(selectedWorkshop.referents_assignats?.length ?? 0) > 0 ? selectedWorkshop.referents_assignats.join(', ') : 'No asignados'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="mt-4">
                                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Descripción</Text>
                                        {/* CORREGIDO: Añadido optional chaining (?.) y valor por defecto (??) */}
                                        <Text className="text-slate-600 text-lg leading-7">
                                            {selectedWorkshop.detalls_tecnics?.descripcio ?? 'No disponible.'}
                                        </Text>
                                    </View>

                                    <View className="mt-6 flex-row gap-4 mb-4">
                                        <TouchableOpacity
                                            onPress={() => console.log('Download PDF')}
                                            className="flex-1 bg-white border border-[#00426b] flex-row items-center justify-center p-3 rounded-lg"
                                        >
                                            <Ionicons name="download-outline" size={20} color="#00426b" style={{ marginRight: 8 }} />
                                            <Text className="text-[#00426b] font-bold">PDF Info</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                onClose();
                                                router.push('/statistics' as any);
                                            }}
                                            className="flex-1 bg-[#00426b] flex-row items-center justify-center p-3 rounded-lg"
                                        >
                                            <Ionicons name="clipboard-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                            <Text className="text-white font-bold">Inscribirse</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}
