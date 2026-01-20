import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface MobileNavbarProps {
  title?: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ title = 'Programa Iter' }) => {
  return (
    <SafeAreaView style={{ backgroundColor: THEME.colors.primary }}>
      <View className="flex-row justify-between items-center h-16 px-4 border-b" style={{ borderColor: THEME.colors.primary }}>
        <View className="flex-row items-center space-x-4">
          {/* Logo */}
          <View className="w-8 h-8 bg-white flex items-center justify-center mr-3">
            <Text style={{ color: THEME.colors.primary }} className="font-black text-xs">E</Text>
          </View>
          <Text className="text-xl font-bold text-white tracking-tight">{title}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MobileNavbar;
