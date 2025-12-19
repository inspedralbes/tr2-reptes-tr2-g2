import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router'; // Importamos Slot
import { FontAwesome } from '@expo/vector-icons';

const TABS = [
  { name: 'Consortium', label: 'The Consortium', path: '/' },
  { name: 'Students', label: 'Students & Families', path: '/students' },
  { name: 'Teachers', label: 'Teachers & PAS', path: '/teachers' },
  { name: 'Centres', label: 'Educational Centres', path: '/centres' },
  { name: 'Workshops', label: 'Workshops', path: '/workshops' }, // Añadido para navegación
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* --- TU CABECERA (TopHeader) --- */}
      <View style={{ paddingTop: insets.top }} className="bg-gray-100 shadow-sm z-50">
        <View className="flex-row items-center border-b border-gray-300">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-1"
            contentContainerStyle={{ paddingLeft: 0 }}
          >
            {TABS.map((tab) => {
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));

              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => router.push(tab.path as Href)}
                  activeOpacity={0.8}
                  className={`
                    px-5 py-4 mr-[1px]
                    ${isActive ? 'bg-[#006996]' : 'bg-gray-200'}
                  `}
                >
                  <Text 
                    className={`
                      font-semibold text-sm
                      ${isActive ? 'text-white' : 'text-slate-700'}
                    `}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="px-2 bg-gray-100 h-full justify-center border-l border-gray-300">
            <TouchableOpacity className="p-2">
              <FontAwesome name="search" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- EL CONTENIDO DE LAS PÁGINAS (Workshops, etc.) --- */}
      <View style={{ flex: 1 }}>
        <Slot /> 
      </View>
    </View>
  );
}