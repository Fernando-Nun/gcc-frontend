'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import useAuth from '@/hooks/useAuth';
import { ordenesAPI } from '@/lib/api';

const TITLES = {
  '/dashboard':      'Dashboard',
  '/upload':         'Cargar Archivos',
  '/ordenes':        'Órdenes',
  '/correos':        'Correos Enviados',
  '/ia/email':       'Redactar Correos',
  '/ia/resumen':     'Resumen Ejecutivo',
  '/ia/comentarios': 'Análisis de Comentarios',
  '/ia/riesgo':      'Predicción de Riesgo',
  '/ia/chat':        'Asistente IA',
};

export default function AppShell({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [badges, setBadges] = useState({});

  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'Expeditación';
  const isAI  = pathname.startsWith('/ia');

  useEffect(() => {
    if (!user) return;
    ordenesAPI.estadisticas()
      .then(d => setBadges({
        atrasado:     d.kpis.atrasado,
        expeditacion: d.kpis.expeditacion,
        atiempo:      d.kpis.atiempo,
      }))
      .catch(() => {});
  }, [user, pathname]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy)',
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={logout} badges={badges} />

        {/* Main */}
        <div style={{
          marginLeft: 'var(--sidebar-w)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.22s ease',
        }}>
          {/* Topbar */}
          <header style={{
            height: 'var(--topbar-h)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 1px 6px rgba(25,43,141,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.35rem',
                color: 'var(--navy)',
                letterSpacing: 2,
              }}>
                {title}
              </span>
              {isAI && <span className="ai-badge">✦ Gemini AI</span>}
            </div>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
            }}>
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric',
              })}
            </span>
          </header>

          {/* Content */}
          <main style={{ padding: 28, flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}