'use client';

import React, { useState, useMemo } from 'react';
import { THEME } from '@enginy/shared';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      // Create date in local time to match the grid day
      const date = new Date(year, currentDate.getMonth(), d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const dayEvents = events.filter(e => {
        // Simple string comparison for the date part (YYYY-MM-DD)
        const eventDate = e.date.split('T')[0];
        return eventDate === dateStr;
      });
      
      days.push({ day: d, date: dateStr, dayEvents });
    }

    return days;
  }, [currentDate, events]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'assignment': return 'bg-green-500';
      case 'session': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-sans animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-50">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black tracking-tighter capitalize" style={{ color: THEME.colors.primary }}>
            {monthName} <span className="text-gray-300 font-medium">{year}</span>
          </h2>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1 shadow-inner">
          <button 
            onClick={prevMonth}
            className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-300 transform active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-2 bg-white shadow-sm rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Avui
          </button>
          <button 
            onClick={nextMonth}
            className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-300 transform active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/30">
        {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
          <div key={d} className="py-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr">
        {calendarDays.map((dateObj, idx) => (
          <div 
            key={idx} 
            className={`min-h-[140px] p-3 border-r border-b border-gray-50 transition-colors duration-500 ${
              dateObj.day ? 'hover:bg-blue-50/20' : 'bg-gray-50/10'
            }`}
          >
            {dateObj.day && (
              <div className="flex flex-col h-full">
                <span className={`text-sm font-black mb-2 ${
                  new Date().toISOString().split('T')[0] === dateObj.date ? 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center -ml-1.5' : 'text-gray-400'
                }`}>
                  {dateObj.day}
                </span>
                
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dateObj.dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`text-[10px] p-2 rounded-lg text-white font-black truncate text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/10 flex items-center gap-1.5 ${getEventColor(event.type)}`}
                    >
                      <div className="w-1 h-1 bg-white/50 rounded-full shrink-0"></div>
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
