'use client';

import React from 'react';
import { THEME } from '@iter/shared';
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
    <div className="min-h-screen flex flex-col bg-[#F2F2F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Breadcrumbs />
        </div>

        {(title || actions) && (
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 py-2">
            <div>
              {title && (
                <h2 className="text-3xl font-black text-[#00426B] tracking-tight uppercase" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1 text-[#4197CB] text-sm font-bold uppercase tracking-wider">{subtitle}</p>}
            </div>

            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </header>
        )}

        <div className="w-full">
          {children}
        </div>
      </main>

      <footer className="py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="text-[#00426B] font-bold text-sm uppercase tracking-widest">Directe a...</h3>
            <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
              <span className="hover:underline cursor-pointer">El Consorci</span>
              <span className="hover:underline cursor-pointer">Alumnat i famílies</span>
              <span className="hover:underline cursor-pointer">Centres educatius</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-[#00426B] font-bold text-sm uppercase tracking-widest">Informació</h3>
            <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
              <span className="hover:underline cursor-pointer">Actualitat</span>
              <span className="hover:underline cursor-pointer">Tràmits</span>
              <span className="hover:underline cursor-pointer">Projectes</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-center md:text-right">
            <p className="text-[#00426B] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Iteració d'Aprenentatge
            </p>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Consorci d'Educació de Barcelona
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
