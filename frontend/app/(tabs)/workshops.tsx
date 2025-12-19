import { View, Text, FlatList, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useState } from 'react';
import WorkshopDetail from '../../components/WorkshopDetail';

const MOCK_DATA = [
  {
    id: '1',
    title: 'Mecánica Básica',
    description: 'Aprende los fundamentos del mantenimiento de vehículos y reparaciones sencillas.',
    count: '8/12',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500',
    teachers: 'Carlos Ruíz, María Elena',
    startDate: '15/04/2024',
    location: 'Taller 1 - Planta Baja'
  },
  {
    id: '2',
    title: 'Cocina Mediterránea',
    description: 'Descubre los secretos de la cocina saludable con ingredientes frescos y locales.',
    count: '12/15',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=500',
    teachers: 'Chef Jordi Cruz',
    startDate: '20/04/2024',
    location: 'Cocina A - Edificio Norte'
  },
  {
    id: '3',
    title: 'Robótica Educativa',
    description: 'Construye y programa tus propios robots usando kits de LEGO y Arduino.',
    count: '5/10',
    image: 'https://images.unsplash.com/photo-1535378437321-6a8fd74f9b00?w=500',
    teachers: 'Ana García',
    startDate: '22/04/2024',
    location: 'Laboratorio de Robótica'
  },
  {
    id: '4',
    title: 'Introducción a React',
    description: 'Crea interfaces de usuario modernas y dinámicas para la web.',
    count: '10/20',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    teachers: 'Biel Capell',
    startDate: '01/05/2024',
    location: 'Aula Informática 3'
  },
  {
    id: '5',
    title: 'Jardinería Urbana',
    description: 'Técnicas para cultivar plantas y huertos en espacios pequeños.',
    count: '6/12',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    teachers: 'Laura M.',
    startDate: '31/12/2025',
    location: 'Loro Jardín'
  },
  {
    id: '6',
    title: 'Fotografía Digital',
    description: 'Domina tu cámara y aprende composición e iluminación profesional.',
    count: '15/15',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    teachers: 'Pedro S.',
    startDate: '31/12/2025',
    location: 'Estudio Fotográfico'
  },
  {
    id: '7',
    title: 'Yoga para Principiantes',
    description: 'Mejora tu flexibilidad y reduce el estrés con posturas básicas.',
    count: '8/10',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8959c9?w=500',
    teachers: 'Marta Y.',
    startDate: '31/12/2025',
    location: 'Gimnasio'
  },
  {
    id: '8',
    title: 'Cerámica Artesanal',
    description: 'Modela y esmaltado de piezas únicas de arcilla.',
    count: '4/8',
    image: 'https://images.unsplash.com/photo-1565193566173-033e46121621?w=500',
    teachers: 'Juan P.',
    startDate: '31/12/2025',
    location: 'Taller de Arte'
  },
  {
    id: '9',
    title: 'Carpintería DIY',
    description: 'Construye tus propios muebles y accesorios de madera.',
    count: '7/10',
    image: 'https://images.unsplash.com/photo-1622675363311-66c3c5c99e98?w=500',
    teachers: 'Roberto C.',
    startDate: '31/12/2025',
    location: 'Taller de Madera'
  }
];

export default function TallerScreen() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<(typeof MOCK_DATA)[0] | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1">
        <Text className="text-[#003B5C] text-xl font-bold text-center mb-6">Tallers Disponibles</Text>

        <FlatList
          data={MOCK_DATA}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 20 }}
          contentContainerClassName="gap-8 pb-24"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedWorkshop(item)}
              className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm"
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-32 bg-slate-200"
                resizeMode="cover"
              />
              {/* Para cambiar el texto de las cards*/}
              <View className="p-3">
                <Text className="text-[#00426b] font-bold text-lg mb-1" numberOfLines={1}>{item.title}</Text>
                <Text className="text-slate-600 text-xs mb-3 leading-4 h-8" numberOfLines={2}>{item.description}</Text>
                <Text className="text-slate-800 text-xs font-bold self-end">Plazas: {item.count}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <WorkshopDetail
        visible={!!selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        selectedWorkshop={selectedWorkshop}
      />
    </SafeAreaView>
  );
}