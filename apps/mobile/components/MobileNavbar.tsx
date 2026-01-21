import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface MobileNavbarProps {
  title?: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ title = 'Iter' }) => {
  return (
    <SafeAreaView style={{ backgroundColor: THEME.colors.primary }}>
      <View className="flex-row justify-between items-center h-16 px-6 border-b-2 border-primary">
        <View className="flex-row items-center">
          {/* Logo - Linear Style */}
          <View className="w-8 h-8 bg-white flex items-center justify-center mr-4 border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
            <Text style={{ color: THEME.colors.primary }} className="font-black text-sm">I</Text>
          </View>
          <View>
            <Text className="text-xl font-black text-white uppercase tracking-tighter">{title}</Text>
            <View className="w-12 h-1 bg-secondary mt-0.5" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MobileNavbar;
