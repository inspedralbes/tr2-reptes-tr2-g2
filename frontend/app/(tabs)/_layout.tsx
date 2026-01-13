import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; 

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout } = useAuth(); 

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* Nav Bar container */}
      <View style={{ paddingTop: insets.top }} className="bg-gray-100 shadow-sm z-10">
        
        <View className="flex-row border-b border-gray-300">
          
          <ScrollView
            className="flex-1" 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0 }}
          >
            {TABS.map((tab, index) => {
              const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));

              return (
                <TouchableOpacity
                  key={tab.path}
                  onPress={() => {
                    router.push(tab.path as Href);
                    setShowProfileMenu(false);
                  }}
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

          {/* Profile Icon and Dropdown */}
          <View className="relative"> 
            <TouchableOpacity 
              className="px-4 py-4 bg-gray-100 justify-center border-l border-gray-300"
              onPress={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FontAwesome name="user-circle" size={20} color="#64748b" />
            </TouchableOpacity>

            {showProfileMenu && (
              <View className="absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <TouchableOpacity
                  className="px-4 py-3 border-b border-gray-200"
                  onPress={() => {
                    router.push('/profile');
                    setShowProfileMenu(false);
                  }}
                >
                  <Text className="text-gray-700">Ver Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={handleLogout}
                >
                  <Text className="text-red-600">Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            )}
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