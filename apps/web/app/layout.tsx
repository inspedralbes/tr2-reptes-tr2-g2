import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Enginy Web',
  description: 'Aplicación web de Enginy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}