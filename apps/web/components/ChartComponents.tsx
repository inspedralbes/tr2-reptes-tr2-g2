'use client';

import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area,
    LineChart, Line
} from 'recharts';

// --- COLORS ---
const COLORS = ['#00426B', '#0775AB', '#4197CB', '#97C9E3', '#CFD2D3'];
const GRADIENTS = {
    blue: ['#00426B', '#0775AB'],
    green: ['#10B981', '#34D399'],
    purple: ['#8B5CF6', '#A78BFA']
};

// --- COMPONENTS ---

export const StatusDistribution = ({ data }: { data: any[] }) => {
    // Ensure we have the three categories even if they are zero
    const categories = ['Pendent', 'Aprovada', 'Rebutjada'];
    const chartData = categories.map(cat => {
        const found = data.find(d => d.estat.toLowerCase() === cat.toLowerCase() || (cat === 'Aprovada' && d.estat === 'aceptado') || (cat === 'Rebutjada' && d.estat === 'rechazado'));
        return {
            name: cat,
            total: found ? found.total : 0
        };
    });

    const getStatusColor = (name: string) => {
        switch (name) {
            case 'Aprovada': return '#10B981'; // Green
            case 'Rebutjada': return '#F26178'; // Red/Pink
            case 'Pendent': return '#F59E0B'; // Amber
            default: return '#00426B';
        }
    };

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorAprovada" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="colorPendent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#D97706" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="colorRebutjada" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F26178" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#D94E63" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                        cursor={{ fill: 'rgba(0, 66, 107, 0.05)' }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={45}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.name === 'Aprovada' ? 'url(#colorAprovada)' :
                                        entry.name === 'Pendent' ? 'url(#colorPendent)' :
                                            'url(#colorRebutjada)'
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WorkshopPopularity = ({ data }: { data: any[] }) => {
    // Transform data: Use d._id directly as the name (backend provides title or fallback)
    const chartData = data.map(d => ({
        name: d._id,
        alumnes: d.alumnes_totals
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorAlumnes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0775AB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0775AB" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#00426B' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                    <Area
                        type="monotone"
                        dataKey="alumnes"
                        stroke="#0775AB"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAlumnes)"
                        dot={{ r: 4, fill: '#00426B', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Nombre de Participants"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

