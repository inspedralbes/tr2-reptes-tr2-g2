import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname, Href, Slot } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useAuth } from '../../context/AuthContext'; 

const TABS = [
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

  // Obtener el nombre de la sección actual para el breadcrumb
  const getBreadcrumbLabel = () => {
    if (pathname.startsWith('/profile')) return 'Perfil';
    const activeTab = TABS.find(tab => pathname.startsWith(tab.path));
    return activeTab ? activeTab.label : '';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff'}}>
      
      {/* --- NAV BAR (Fondo gris extendido) --- */}
      <View style={{ paddingTop: insets.top, zIndex: 50 }} className="bg-[#f2f2f3] border-b border-gray-300">
        <ResponsiveContainer>
          <View className="flex-row">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="flex-1"
            >
              {TABS.map((tab) => {
                const isActive = pathname.startsWith(tab.path);
                return (
                  <TouchableOpacity
                    key={tab.path}
                    onPress={() => router.push(tab.path as Href)}
                    activeOpacity={0.8}
                    className={`px-5 py-4 ${isActive ? 'bg-[#0073ab]' : 'bg-[#f2f2f3]'}`}
                  >
                    <Text className={`font-bold text-[13px] ${isActive ? 'text-white' : 'text-[#0073ab]'}`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Perfil de usuario */}
            <View className="px-4 justify-center z-50">
            <TouchableOpacity 
              className="px-4 py-4 bg-gray-100 justify-center border-l border-gray-300"
              onPress={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FontAwesome name="user-circle" size={20} color="#64748b" />
            </TouchableOpacity>
                        {showProfileMenu && (
              <View className="absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
        </ResponsiveContainer>
      </View>

      {/* --- BREADCRUMBS (Alineado con el contenido) --- */}
      <View>
        <ResponsiveContainer>
          <View className="flex-row items-center py-3">
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text className="text-[#0073ab] text-xs">Inici</Text>
            </TouchableOpacity>
            
            {pathname !== '/' && (
              <>
                <Text className="text-gray-400 text-xs mx-2 font-light">{'>'}</Text>
                <Text className="text-gray-500 text-xs">{getBreadcrumbLabel()}</Text>
              </>
            )}
          </View>
        </ResponsiveContainer>
        {/* Línea decorativa fina de la web */}
        <View className="h-[1px] bg-gray-100 w-full" />
      </View>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <ScrollView className="flex-1">
        <ResponsiveContainer style={{ paddingVertical: 20 }}>
          <Slot />
        </ResponsiveContainer>
      </ScrollView>

    </View>
  );
}