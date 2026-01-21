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

      <main className="flex-1 max-w-[1440px] mx-auto w-full py-8 md:py-16 flex flex-col items-start">

        {(title || actions) && (
          <header className="w-full mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 py-2 container-responsive">
            <div className="">
              {title && (
                <h2 className="text-2xl md:text-3xl font-black text-[#00426B] tracking-tight uppercase" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1 text-[#4197CB] text-[10px] md:text-sm font-bold uppercase tracking-wider">{subtitle}</p>}
            </div>

            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </header>
        )}

        <div className="w-full container-responsive">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
