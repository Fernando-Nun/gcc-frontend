import './globals.css';

export const metadata = {
  title: 'GCC México — Expeditación',
  description: 'Sistema de gestión de expeditación y seguimiento de proveedores',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}