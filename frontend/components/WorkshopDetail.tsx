import { View, Text, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Workshop {
    id: string;
    title: string;
    description: string;
    count: string;
    image: string;
    teachers: string;
    startDate: string;
    location: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedWorkshop: Workshop | null;
}

export default function WorkshopDetail({ visible, onClose, selectedWorkshop }: Props) {
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
                            <View className="relative">
                                <Image
                                    source={{ uri: selectedWorkshop.image }}
                                    className="w-full h-64 bg-slate-200"
                                    resizeMode="cover"
                                />

                                {/* Boton para cerrar */}
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View className="p-6">
                                <Text className="text-[#00426b] text-3xl font-bold mb-4">{selectedWorkshop.title}</Text>

                                <View className="flex-row items-center mb-6">
                                    <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                                        <Text className="text-blue-800 font-bold">{selectedWorkshop.count} Plazas</Text>
                                    </View>
                                    <View className="bg-green-100 px-3 py-1 rounded-full">
                                        <Text className="text-green-800 font-bold">{selectedWorkshop.startDate}</Text>
                                    </View>
                                </View>

                                <View className="space-y-4">
                                    <View className="flex-row items-start">
                                        <Ionicons name="location-outline" size={24} color="#00426b" style={{ marginRight: 10 }} />
                                        <View>
                                            <Text className="text-slate-500 font-bold text-xs uppercase">Ubicación</Text>
                                            <Text className="text-slate-800 text-lg">{selectedWorkshop.location}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-start">
                                        <Ionicons name="people-outline" size={24} color="#00426b" style={{ marginRight: 10 }} />
                                        <View>
                                            <Text className="text-slate-500 font-bold text-xs uppercase">Profesores</Text>
                                            <Text className="text-slate-800 text-lg">{selectedWorkshop.teachers}</Text>
                                        </View>
                                    </View>

                                    <View className="mt-4">
                                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Descripción</Text>
                                        <Text className="text-slate-600 text-lg leading-7">{selectedWorkshop.description}</Text>
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
                                            onPress={() => console.log('Go to Form')}
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