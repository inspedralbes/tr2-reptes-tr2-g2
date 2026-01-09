import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

// Definición de las pestañas de navegación
const TABS = [
  { name: 'Index', label: 'Inici', path: '/' },
  { name: 'Workshops', label: 'Tallers', path: '/workshops' },
  { name: 'Students', label: 'Alumnes', path: '/students' },
  { name: 'Calendar', label: 'Calendari', path: '/calendar' },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* --- CABECERA SUPERIOR (Navbar) --- */}
      <View style={{ paddingTop: insets.top }} className="bg-gray-100 shadow-sm z-10">
        <View className="flex-row items-center border-b border-gray-300">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0 }}
          >
            {TABS.map((tab, index) => {
              // Comprueba si la ruta actual coincide con la pestaña
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
              const isLast = index === TABS.length - 1;

              return (
                <TouchableOpacity
                  key={tab.path}
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

          {/* Icono de perfil a la derecha */}
          <View className="px-4 bg-gray-100 h-full justify-center border-l border-gray-300">
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.push('/profile')}
            >
              <FontAwesome name="user-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <View className="flex-1 items-center bg-gray-50">
        <View className="w-full max-w-7xl p-4 md:p-6">
          <Slot />
        </View>
      </View>
    </View>
  );
}