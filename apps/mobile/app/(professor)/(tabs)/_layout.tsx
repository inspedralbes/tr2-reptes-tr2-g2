import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { THEME } from '@iter/shared';
import { useColorScheme } from 'nativewind';

export default function ProfessorTabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Tauler</Label>
        <Icon sf="square.grid.2x2" md="dashboard" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="avisos">
        <Label>Avisos</Label>
        <Icon sf="bell" md="notifications" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="talleres">
        <Label>Calendari</Label>
        <Icon sf="calendar" md="calendar_today" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="coordinacion">
        <Label>Col·laboració</Label>
        <Icon sf="person.2" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <Label>Perfil</Label>
        <Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}