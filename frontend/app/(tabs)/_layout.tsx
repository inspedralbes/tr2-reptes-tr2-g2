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
      
      {/* Nav Bar */}
      <View style={{ paddingTop: insets.top }} className="bg-gray-100 shadow-sm z-10">
        
        {/* Contenedor Fila */}
        <View className="flex-row items-center border-b border-gray-300">
          
          <ScrollView
            className="flex-1" 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0 }}
          >
            {TABS.map((tab, index) => {
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
              const isLast = index === TABS.length - 1;

              return (
                <TouchableOpacity
                  key={tab.path}
                  onPress={() => router.push(tab.path as Href)}
                  activeOpacity={0.8}
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

          <View className="border-l border-gray-300 bg-gray-100">
            <TouchableOpacity className="p-4 items-center justify-center">
              <FontAwesome name="search" size={18} color="#64748b" />
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