import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router'; // Importamos Slot
import { FontAwesome } from '@expo/vector-icons';

const TABS = [
  { name: 'Consortium', label: 'The Consortium', path: '/' },
  { name: 'Workshops', label: 'Workshops', path: '/workshops' }, // Añadido para navegación
  { name: 'Students', label: 'Students & Families', path: '/students' },
  { name: 'Teachers', label: 'Teachers & PAS', path: '/teachers' },
  { name: 'Centres', label: 'Educational Centres', path: '/centres' },
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
            {TABS.map((tab, index) => {
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
              const isLast = index === TABS.length - 1;

              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => router.push(tab.path as Href)}
                  activeOpacity={0.8}
                  className={`
                    p-4
                    ${!isLast ? 'border-r border-gray-300' : ''}
                    ${isActive ? 'bg-[#006996]' : 'bg-gray-100'}
                  `}
                >
                  <Text
                    className={`
                      font-bold text-xs uppercase tracking-wide
                      ${isActive ? 'text-white' : 'text-slate-600'}
                    `}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="px-4 bg-gray-100 h-full justify-center border-l border-gray-300">
            <TouchableOpacity className="p-2">
              <FontAwesome name="search" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- EL CONTENIDO DE LAS PÁGINAS (Workshops, etc.) --- */}
      <View className="flex-1 px-40 pt-6">
        <Slot />
      </View>
    </View>
  );
}