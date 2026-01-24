import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Iter Web',
  description: 'Aplicación web de Iter',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right" 
            offset={80}
            toastOptions={{
              className: 'font-bold uppercase text-[10px] tracking-widest',
              style: {
                borderRadius: '0px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '16px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}