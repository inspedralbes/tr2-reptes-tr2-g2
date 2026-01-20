import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { THEME } from '@iter/shared';
import { BlurView } from 'expo-blur';

export default function ProfessorLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'white',
            ...Platform.select({
              android: {
                elevation: 4,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
              },
              ios: {
                shadowColor: 'transparent',
              }
            })
          },
          headerTintColor: '#00426B',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarActiveTintColor: '#00426B',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            height: 75,
            borderRadius: 38,
            backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : 'white',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            paddingBottom: Platform.OS === 'ios' ? 0 : 10,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          tabBarBackground: () => 
            Platform.OS === 'ios' ? (
              <BlurView intensity={90} style={{ flex: 1 }} tint="light" />
            ) : null,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginBottom: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tauler',
            tabBarLabel: 'Tauler',
            headerTitle: "Panell d'Administració",
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ 
                backgroundColor: focused ? 'rgba(0, 66, 107, 0.08)' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="grid" size={24} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="talleres"
          options={{
            title: 'Agenda',
            headerTitle: 'La teva Agenda',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ 
                backgroundColor: focused ? 'rgba(0, 66, 107, 0.08)' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="calendar" size={24} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="coordinacion"
          options={{
            title: 'Col·laboració',
            headerTitle: 'Col·laboració',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ 
                backgroundColor: focused ? 'rgba(0, 66, 107, 0.08)' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="people" size={24} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            headerTitle: 'El meu compte',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ 
                backgroundColor: focused ? 'rgba(0, 66, 107, 0.08)' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="person" size={24} color={color} />
              </View>
            ),
          }}
        />
        {/* Hidden internal screens should be kept here as routes if they are parts of this group but not tabs */}
        <Tabs.Screen
          name="sesion/[id]"
          options={{
            href: null,
            headerTitle: 'Assistència',
          }}
        />
        <Tabs.Screen
          name="evaluacion/[id]"
          options={{
            href: null,
            headerTitle: 'Rúbrica Digital',
          }}
        />
      </Tabs>
    </View>
  );
}
