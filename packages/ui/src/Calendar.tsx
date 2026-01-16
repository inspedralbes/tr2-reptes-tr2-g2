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

  const calendarWeeks = useMemo(() => {
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

    // Split into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  const getEventStyles = (type: string, title: string = '') => {
    const isPhase = title.toLowerCase().includes('fase');
    
    if (isPhase) {
      if (title.includes('Solicitud')) return 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]';
      if (title.includes('Planificación')) return 'bg-[#00426B] text-white shadow-[0_4px_12px_rgba(0,66,107,0.2)]';
      if (title.includes('Ejecución')) return 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.2)]';
      if (title.includes('Cierre')) return 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(5,150,105,0.2)]';
      return 'bg-blue-700 text-white';
    }

    switch (type) {
      case 'milestone': 
        return 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]';
      case 'deadline': 
        return 'bg-[#F26178] text-white shadow-[0_4px_12px_rgba(242,97,120,0.2)]';
      case 'assignment': 
        return 'bg-[#4197CB] text-white shadow-[0_4px_12px_rgba(65,151,203,0.2)] shadow-inner';
      case 'session': 
        return 'bg-[#00426B] text-white shadow-[0_4px_12px_rgba(0,66,107,0.2)]';
      default: 
        return 'bg-gray-500 text-white';
    }
  };

  const isSameDay = (d1: string, d2: string) => d1.split('T')[0] === d2.split('T')[0];

  return (
    <div className="bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex items-center justify-between p-12 bg-white sticky top-0 z-30 border-b border-gray-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-5xl font-black tracking-[-0.04em] capitalize text-[#00426B] flex items-baseline gap-3">
            {monthName} <span className="text-[#00426B]/20 font-black tracking-tight">{year}</span>
          </h2>
        </div>
        <div className="flex bg-[#F8FAFB] p-2.5 rounded-[32px] gap-2 border border-gray-100 shadow-inner">
          <button 
            onClick={prevMonth}
            className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-xl rounded-[24px] transition-all duration-500 text-[#00426B]/40 hover:text-[#00426B] active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-10 h-12 bg-white shadow-sm rounded-[24px] text-[11px] font-black uppercase tracking-[0.25em] text-[#00426B] hover:shadow-xl transition-all active:scale-95 border border-gray-50"
          >
            Avui
          </button>
          <button 
            onClick={nextMonth}
            className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-xl rounded-[24px] transition-all duration-500 text-[#00426B]/40 hover:text-[#00426B] active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 border-b border-gray-50 bg-[#F8FAFB]/30">
        {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
          <div key={d} className="py-6 text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#CFD2D3]">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col bg-white">
        {calendarWeeks.map((week, weekIdx) => {
          const firstDayOfWeek = week[0].date;
          const lastDayOfWeek = week[6].date;
          
          const weekEvents: any[] = [];
          if (firstDayOfWeek && lastDayOfWeek) {
            events.forEach(event => {
              const eStart = event.date.split('T')[0];
              const eEnd = (event.endDate || event.date).split('T')[0];
              
              if (eStart <= lastDayOfWeek && eEnd >= firstDayOfWeek) {
                const startIdx = week.findIndex(d => d.date && d.date >= eStart);
                const actualStart = startIdx === -1 ? 0 : startIdx;
                
                const endIdx = week.findIndex(d => d.date && d.date >= eEnd);
                const actualEnd = endIdx === -1 ? 6 : endIdx;
                
                weekEvents.push({
                  ...event,
                  start: actualStart,
                  span: actualEnd - actualStart + 1,
                  continuesBefore: eStart < firstDayOfWeek,
                  continuesAfter: eEnd > lastDayOfWeek,
                  isPhase: event.title.toLowerCase().includes('fase')
                });
              }
            });
          }

          // Track assignment
          const tracks: any[][] = [];
          weekEvents.sort((a, b) => b.span - a.span).forEach(event => {
            let trackIdx = 0;
            while (tracks[trackIdx] && tracks[trackIdx].some(e => 
              (event.start >= e.start && event.start < e.start + e.span) ||
              (e.start >= event.start && e.start < event.start + event.span)
            )) {
              trackIdx++;
            }
            if (!tracks[trackIdx]) tracks[trackIdx] = [];
            tracks[trackIdx].push(event);
          });

          return (
            <div key={weekIdx} className="grid grid-cols-7 relative border-b border-gray-50 last:border-b-0 min-h-[160px]">
              {/* Background Days */}
              {week.map((dateObj, dayIdx) => (
                <div 
                  key={dayIdx} 
                  className={`relative p-5 border-r border-gray-50 last:border-r-0 transition-colors duration-500 ${
                    dayIdx === 5 || dayIdx === 6 ? 'bg-[#F8FAFB]/60' : ''
                  }`}
                >
                  {dateObj.day && (
                    <span className={`text-[13px] font-black tracking-tight ${
                      isSameDay(new Date().toISOString(), dateObj.date!) 
                        ? 'text-blue-600' 
                        : 'text-[#CFD2D3]'
                    }`}>
                      {dateObj.day}
                    </span>
                  )}
                </div>
              ))}

              {/* Event Bars Overlay */}
              <div className="absolute top-12 left-0 w-full h-full pointer-events-none px-1 py-1">
                {tracks.map((track, trackIdx) => (
                  <div key={trackIdx} className="h-8 mb-2 relative w-full">
                    {track.map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={`absolute h-full pointer-events-auto flex items-center px-4 transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.98] group/event ${getEventStyles(event.type, event.title)}`}
                        style={{
                          left: `${(event.start * 100) / 7}%`,
                          width: `${(event.span * 100) / 7}%`,
                          marginLeft: event.continuesBefore ? '0' : '4px',
                          marginRight: event.continuesAfter ? '0' : '4px',
                          borderRadius: event.isPhase 
                            ? `${event.continuesBefore ? '0' : '8px'} ${event.continuesAfter ? '0' : '8px'} ${event.continuesAfter ? '0' : '8px'} ${event.continuesBefore ? '0' : '8px'}`
                            : '20px'
                        }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                           <div className="w-1.5 h-1.5 bg-white/60 rounded-full shrink-0"></div>
                           <span className="text-[10px] font-black text-white truncate uppercase tracking-[0.1em] leading-none">
                             {event.title}
                           </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
