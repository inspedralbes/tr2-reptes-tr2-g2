import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

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
      
      {/* Nav Bar container */}
      <View style={{ paddingTop: insets.top }} className="bg-gray-100 shadow-sm z-10">
        
        {/* CORRECCIÓN 1: 
           Quitamos 'items-center'. 
           Ahora usa el defecto (stretch), por lo que el ScrollView y la vista del perfil tendrán la misma altura.
        */}
        <View className="flex-row border-b border-gray-300">
          
          <ScrollView
            className="flex-1" 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0 }}
          >
            {TABS.map((tab, index) => {
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
              // const isLast = index === TABS.length - 1; // No se usa actualmente

              return (
                <TouchableOpacity
                  key={tab.path}
                  onPress={() => router.push(tab.path as Href)}
                  activeOpacity={0.8}
                  // La altura de la barra la define este padding (py-4)
                  className={`
                    px-5 py-4
                    border-r border-gray-300
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

          {/* CORRECCIÓN 2: 
             Quitamos 'h-full'. El padre ya lo estira.
             Mantenemos 'justify-center' para que el icono quede en el medio verticalmente.
          */}
          <View className="px-4 bg-gray-100 justify-center border-l border-gray-300">
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.push('/profile')}
            >
              <FontAwesome name="user-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- Body --- */}
      <View className="flex-1 bg-gray-50">
        <Slot />
      </View>
    </View>
  );
}