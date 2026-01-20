import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { THEME } from '@iter/shared';
import { getCalendar } from '../../services/api';
import CalendarView, { CalendarEvent } from '../../components/CalendarView';

export default function AgendaScreen() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const calendarRes = await getCalendar();
        setCalendarEvents(calendarRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB] pt-4">

      <CalendarView 
        events={calendarEvents} 
        onEventClick={(event) => {
          if (event.type === 'assignment' && event.metadata?.id_assignacio) {
            // Se podria implementar una navegacion directa si fuera necesario
          }
        }}
      />
    </View>
  );
}
