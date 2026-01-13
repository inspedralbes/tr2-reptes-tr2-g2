import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Stack } from 'expo-router';

// Configuración en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

// Mock de eventos para la ciudad baja
const MOCK_EVENTS = [
  { id: '1', title: 'Taller de Programación', date: '2026-01-15', center: 'Centro Ciudad Baja' },
  { id: '2', title: 'Reparación de Hardware', date: '2026-01-20', center: 'Sede Norte' },
  { id: '3', title: 'Diseño Gráfico Básico', date: '2026-01-22', center: 'Centro Ciudad Baja' },
  { id: '4', title: 'Introducción a Redes', date: '2026-02-05', center: 'Aula Digital' },
];

export default function CalendarScreen() {
  const [selected, setSelected] = useState('');

  // Ordenamos los eventos por fecha
  const sortedEvents = useMemo(() => {
    return [...MOCK_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  // Generamos los puntos en el calendario para todos los eventos
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Marcamos los eventos existentes con puntos azules
    sortedEvents.forEach(event => {
      marks[event.date] = { marked: true, dotColor: '#3b82f6' };
    });

    // Resaltamos el día seleccionado
    if (selected) {
      marks[selected] = { 
        ...marks[selected], 
        selected: true, 
        selectedColor: '#3b82f6' 
      };
    }
    
    return marks;
  }, [selected, sortedEvents]);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Agenda de Talleres', headerShadowVisible: false }} />
      
      {/* Contenedor Principal en Fila */}
      <View className="flex-1 flex-row p-4 gap-4">
        
        {/* COLUMNA IZQUIERDA: CALENDARIO */}
        <View className="flex-[1.2]">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Calendar
              onDayPress={day => setSelected(day.dateString)}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#3b82f6',
                todayTextColor: '#3b82f6',
                arrowColor: '#3b82f6',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          </View>
          
          {/* Info rápida debajo del calendario */}
          <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Text className="text-blue-800 font-bold mb-1">Día Seleccionado</Text>
            <Text className="text-blue-600">
              {selected ? new Date(selected).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'Ningún día seleccionado'}
            </Text>
          </View>
        </View>

        {/* COLUMNA DERECHA: LISTADO DE EVENTOS */}
        <View className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <View className="p-4 border-b border-gray-100 bg-gray-50">
            <Text className="font-bold text-gray-800 text-lg">Próximos Eventos</Text>
          </View>

          <FlatList
            data={sortedEvents}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View 
                className={`mb-3 p-4 rounded-xl border ${selected === item.date ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="font-bold text-gray-900 flex-1">{item.title}</Text>
                  <Text className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded uppercase">
                    {item.date}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs">{item.center}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-gray-400 text-center mt-10">No hay eventos programados</Text>
            }
          />
        </View>

      </View>
    </View>
  );
}