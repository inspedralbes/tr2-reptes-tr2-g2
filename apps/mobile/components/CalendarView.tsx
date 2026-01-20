import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { useRouter } from 'expo-router';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const firstDay = (firstDayOfMonth(year, currentDate.getMonth()) + 6) % 7; // Adjust to Monday start
    const days = [];

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, currentDate.getMonth(), d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }

    // Padding for next month to complete the last week
    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null });
    }

    return days;
  }, [currentDate]);

  const getEventsForDay = (dateStr: string) => {
    return events.filter(event => {
      const eStart = event.date.split('T')[0];
      const eEnd = (event.endDate || event.date).split('T')[0];
      return dateStr >= eStart && dateStr <= eEnd;
    });
  };

  const dayEvents = useMemo(() => getEventsForDay(selectedDate), [selectedDate, events]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return THEME.colors.primary;
      case 'deadline': return THEME.colors.accent;
      case 'assignment': return THEME.colors.secondary;
      default: return THEME.colors.neutral;
    }
  };

  const openMaps = (address: string, label: string) => {
    if (!address) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const url = Platform.select({
      ios: `${scheme}${label}@${address}`,
      android: `${scheme}0,0?q=${address}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter">
          {monthName} <Text className="text-gray-300">{year}</Text>
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity onPress={prevMonth} className="p-2 bg-gray-50 border border-gray-100">
            <Ionicons name="chevron-back" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} className="p-2 bg-gray-50 border border-gray-100">
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekdays */}
      <View className="flex-row border-b border-gray-50 bg-gray-50/50">
        {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
          <View key={d} className="flex-1 py-3 items-center">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((dateObj, idx) => {
          const isSelected = dateObj.date === selectedDate;
          const isToday = dateObj.date === new Date().toISOString().split('T')[0];
          const hasEvents = dateObj.date ? getEventsForDay(dateObj.date).length > 0 : false;
          const dayEventsForDot = dateObj.date ? getEventsForDay(dateObj.date) : [];

          return (
            <TouchableOpacity 
              key={idx} 
              onPress={() => dateObj.date && setSelectedDate(dateObj.date)}
              className={`w-[14.28%] aspect-square items-center justify-center border-b border-r border-gray-50 ${isSelected ? 'bg-primary' : ''}`}
              disabled={!dateObj.date}
            >
              {dateObj.day && (
                <>
                  <Text className={`text-sm font-black ${isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-gray-900'}`}>
                    {dateObj.day}
                  </Text>
                  {hasEvents && !isSelected && (
                    <View className="flex-row mt-1 space-x-0.5">
                      {dayEventsForDot.slice(0, 3).map((e, i) => (
                        <View key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: getEventColor(e.type) }} />
                      ))}
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Events List / Agenda Style */}
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-6">
          <View className="w-6 h-1 bg-accent mr-3" />
          <Text className="text-xs font-black text-gray-900 uppercase tracking-[2px]">
            {new Date(selectedDate).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {dayEvents.length === 0 ? (
          <Text className="text-gray-400 font-bold text-[11px] uppercase tracking-widest text-center mt-10">
            No hi ha esdeveniments per a aquest dia
          </Text>
        ) : (
          dayEvents.map(event => (
            <View 
              key={event.id}
              className="mb-6 bg-white border border-gray-200 p-6"
            >
              <View className="flex-row items-center mb-6">
                <View className={`p-3 mr-4 ${event.type === 'assignment' ? 'bg-blue-50' : event.type === 'milestone' ? 'bg-indigo-50' : 'bg-red-50'}`}>
                  <Ionicons 
                    name={event.type === 'assignment' ? 'hardware-chip' : event.type === 'milestone' ? 'flag' : 'alert-circle'} 
                    size={20} 
                    color={event.type === 'assignment' ? '#3B82F6' : event.type === 'milestone' ? '#6366F1' : '#EF4444'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 leading-tight uppercase tracking-tight">{event.title}</Text>
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    {event.type === 'assignment' ? 'Taller' : event.type === 'milestone' ? 'Milla' : 'Límit'}
                  </Text>
                </View>
              </View>

              {event.type === 'assignment' && event.metadata && (
                <View className="space-y-4">
                  <Text className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-3">{event.metadata.centre}</Text>
                  
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-500 font-bold ml-3 text-[10px] uppercase tracking-wider">{event.metadata.hora}</Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => openMaps(event.metadata.adreca, event.title)}
                    className="flex-row items-center bg-gray-50 p-4 border border-gray-200 mb-6"
                  >
                    <Ionicons name="location-outline" size={16} color={THEME.colors.secondary} />
                    <Text className="text-gray-900 font-bold ml-3 flex-1 text-[10px]" numberOfLines={1}>
                      {event.metadata.adreca || 'Sense adreça'}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row space-x-3">
                    <TouchableOpacity 
                      onPress={() => router.push(`/(professor)/sesion/${event.metadata.id_assignacio}`)}
                      className="flex-1 bg-primary py-3 items-center"
                    >
                      <Text className="text-white font-bold text-xs uppercase tracking-wider">Assistència</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => router.push(`/(professor)/evaluacion/${event.metadata.id_assignacio}`)}
                      className="flex-1 border border-primary py-3 items-center"
                    >
                      <Text className="text-primary font-bold text-xs uppercase tracking-wider">Avaluar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {event.type !== 'assignment' && event.description && (
                <Text className="text-gray-500 font-bold text-[11px] leading-5 italic">
                  "{event.description}"
                </Text>
              )}
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default CalendarView;
