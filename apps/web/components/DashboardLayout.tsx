'use client';

import React from 'react';
import { THEME } from '@enginy/shared';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: THEME.colors.background }}>
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        
        {(title || actions) && (
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-left duration-500">
              {title && (
                <h2 className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: THEME.fonts.primary }}>
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-2 text-gray-500 text-lg font-medium">{subtitle}</p>}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500">
                {actions}
              </div>
            )}
          </header>
        )}
        
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>
      
      <footer className="py-8 border-t bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Programa Enginy • Consorci d'Educació de Barcelona
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
