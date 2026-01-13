import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import { Stack } from 'expo-router';

interface Taller {
  id: string;
  title: string;
  date: string;
  center: string;
  time: string;
}

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const MOCK_EVENTS: Taller[] = [
  { id: '1', title: 'Taller de Programación', date: '2026-01-15', center: 'Centro', time: '10:00' },
  { id: '2', title: 'Reparación de Hardware', date: '2026-01-20', center: 'Sede Norte', time: '12:30' },
  { id: '3', title: 'Diseño Gráfico Básico', date: '2026-01-22', center: 'Centro', time: '16:00' },
  { id: '4', title: 'Introducción a Redes', date: '2026-02-05', center: 'Aula Digital', time: '09:00' },
];

export default function CalendarScreen() {
  const [selected, setSelected] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Calculamos el ancho exacto de un día para evitar que se deformen
  const DAY_WIDTH = useMemo(() => width / 7, [width]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return MOCK_EVENTS.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.center.toLowerCase().includes(query) ||
      event.date.includes(query)
    );
  }, [searchQuery]);

  const eventsByDate = useMemo(() => {
    const map: { [key: string]: Taller[] } = {};
    filteredEvents.forEach(event => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [filteredEvents]);

  // CELDA PARA MÓVIL: Corregida sin flex-1 para evitar el bug de ancho
  const CustomDay = ({ date, state }: any) => {
    const dayEvents = eventsByDate[date.dateString] || [];
    const isSelected = selected === date.dateString;
    const isToday = state === 'today';

    return (
      <TouchableOpacity 
        onPress={() => setSelected(date.dateString)}
        style={{ width: DAY_WIDTH, height: 90 }} // Altura fija y ancho exacto
        className={`border-[0.2px] border-gray-100 p-1 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
      >
        <Text className={`text-[10px] font-bold ${isToday ? 'text-red-500' : 'text-gray-900'} ${state === 'disabled' ? 'opacity-20' : ''}`}>
          {date.day}
        </Text>
        <View className="mt-1">
          {dayEvents.slice(0, 2).map((event, index) => (
            <View key={index} className="bg-blue-600 rounded-[2px] px-1 mb-[2px]">
              <Text className="text-[7px] text-white font-semibold" numberOfLines={1}>
                {event.title}
              </Text>
            </View>
          ))}
          {dayEvents.length > 2 && (
            <Text className="text-[7px] text-gray-400 font-medium">+{dayEvents.length - 2}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Calendario', headerShadowVisible: false }} />
      
      {/* Buscador minimalista */}
      <View className="px-4 py-2 bg-white border-b border-gray-50">
        <View className="bg-gray-100 rounded-xl px-3 flex-row items-center h-10">
          <Text className="mr-2">🔍</Text>
          <TextInput
            placeholder="Buscar talleres..."
            placeholderTextColor="#999"
            className="flex-1 text-gray-800"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isMobile ? (
        <View className="flex-1">
          <CalendarList
            dayComponent={CustomDay}
            pastScrollRange={6}
            futureScrollRange={12}
            scrollEnabled={true}
            showScrollIndicator={false}
            calendarWidth={width} // Forzamos el ancho de la pantalla
            calendarHeight={560} 
            theme={iOSTheme}
            // Eliminamos padding predeterminado que estrecha los días
            style={{ paddingLeft: 0, paddingRight: 0 }} 
          />
        </View>
      ) : (
        <View className="flex-1 flex-row">
          <View className="flex-[1.2] border-r border-gray-100">
            <Calendar
              onDayPress={day => setSelected(day.dateString)}
              markedDates={{
                ...Object.keys(eventsByDate).reduce((acc: any, date) => {
                  acc[date] = { marked: true, dotColor: '#3b82f6' };
                  return acc;
                }, {}),
                [selected]: { selected: true, selectedColor: '#3b82f6' }
              }}
              theme={iOSTheme}
            />
          </View>
          
          <View className="flex-1">
             <ScrollView>
                <View className="p-4 border-b border-gray-100">
                   <Text className="font-bold text-gray-900 text-xl">Eventos</Text>
                </View>
                {filteredEvents.map(item => (
                  <View key={item.id} className="flex-row p-4 border-b border-gray-50 items-center">
                    <View className="w-12 items-center">
                      <Text className="text-[10px] font-bold text-blue-600 uppercase">
                        {new Date(item.date).toLocaleString('es', { month: 'short' })}
                      </Text>
                      <Text className="text-xl font-light text-gray-900">{new Date(item.date).getDate()}</Text>
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="font-semibold text-gray-900 text-base">{item.title}</Text>
                      <Text className="text-gray-400 text-xs">{item.time} · {item.center}</Text>
                    </View>
                  </View>
                ))}
             </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const iOSTheme: any = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#737373',
  todayTextColor: '#ef4444',
  dayTextColor: '#000000',
  textDisabledColor: '#d1d5db',
  monthTextColor: '#000000',
  textMonthFontSize: 24,
  textMonthFontWeight: '700',
  textDayHeaderFontSize: 11,
  textDayHeaderFontWeight: '600',
  // Ajustes de estilos internos para quitar márgenes que "aprietan" los días
  'stylesheet.calendar.main': {
    monthView: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    week: {
      marginTop: 0,
      marginBottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    }
  },
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingLeft: 15,
      marginTop: 20,
      marginBottom: 10,
    },
    dayHeader: {
      width: 45, // Ajustado para que coincida con el centro de DAY_WIDTH aprox
      textAlign: 'center',
      color: '#8e8e93',
      textTransform: 'uppercase',
    },
  },
};