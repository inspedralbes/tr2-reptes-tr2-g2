import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export default function ProfessorLayout() {
  return (
    <NativeTabs
      tintColor="#00426B"
      backgroundColor="white"
    >
      <NativeTabs.Trigger 
        name="index"
        options={{
          title: 'Tauler',
        }}
      >
        <Label>Tauler</Label>
        <Icon sf="square.grid.2x2.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="talleres"
        options={{
          title: 'Agenda',
        }}
      >
        <Label>Agenda</Label>
        <Icon sf="calendar" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="coordinacion"
        options={{
          title: 'Col·laboració',
        }}
      >
        <Label>Col·laboració</Label>
        <Icon sf="person.2.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="perfil"
        options={{
          title: 'Perfil',
        }}
      >
        <Label>Perfil</Label>
        <Icon sf="person.circle.fill" />
      </NativeTabs.Trigger>

      {/* Internal screens that aren't tabs */}
      <NativeTabs.Trigger
        name="sesion/[id]"
        options={{
          href: null,
        }}
      />
      
      <NativeTabs.Trigger
        name="evaluacion/[id]"
        options={{
          href: null,
        }}
      />
    </NativeTabs>
  );
}
