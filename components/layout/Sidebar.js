'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, LogOut, Bot, AlertTriangle, Brain, FileText, TrendingUp, CircleAlert, Upload, CircleCheck, Mail} from 'lucide-react';

const NAV = [
  {
    section: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard',       icon: <LayoutDashboard />, href: '/dashboard' },
      { id: 'upload',    label: 'Cargar Archivos',  icon: <Upload />, href: '/upload'    },
    ],
  },
  {
    section: 'Órdenes',
    items: [
      { id: 'atrasado',     label: 'Atrasadas',    icon: <CircleAlert />, href: '/ordenes?status=atrasado',     badgeKey: 'atrasado',     badgeColor: 'var(--red)'    },
      { id: 'expeditacion', label: 'Expeditación', icon: <TrendingUp />, href: '/ordenes?status=expeditacion', badgeKey: 'expeditacion', badgeColor: 'var(--yellow)' },
      { id: 'atiempo',      label: 'A Tiempo',     icon: <CircleCheck />, href: '/ordenes?status=atiempo',      badgeKey: 'atiempo',      badgeColor: 'var(--green)'  },
    ],
  },
  {
    section: 'Herramientas IA',
    isAI: true,
    items: [
      { id: 'ia-email',       label: 'Redactar Correos',     icon: <Mail />, href: '/ia/email'       },
      { id: 'ia-resumen',     label: 'Resumen Ejecutivo',    icon: <FileText />, href: '/ia/resumen'     },
      { id: 'ia-comentarios', label: 'Análisis Comentarios', icon: <Brain />, href: '/ia/comentarios' },
      { id: 'ia-riesgo',      label: 'Predicción de Riesgo', icon: <AlertTriangle />, href: '/ia/riesgo'     },
      { id: 'ia-chat',        label: 'Asistente IA',         icon: <Bot />, href: '/ia/chat'        },
    ],
  },
];

export default function Sidebar({ user, onLogout, badges = {}, collapsed = false, onToggle }) {
  // collapsed is now controlled by parent; fallback to local state if not provided? we assume parent handles it
  const router   = useRouter();
  const pathname = usePathname();

  function isActive(href) {
    return pathname === href.split('?')[0];
  }

  return (
    <aside style={{
      width: collapsed ? '60px' : 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'var(--navy-dark)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
      transition: 'width 0.22s ease',
      overflow: 'hidden',
      boxShadow: '2px 0 12px rgba(10,18,60,0.18)',
    }}>

      {/* Logo + toggle */}
<div style={{
  padding: collapsed ? '40px' : '0 12px',
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  flexShrink: 0,
  gap: 8,
}}>

  {!collapsed ? (
  <Image
    src="/imagotipo-gcc.svg"
    alt="GCC México"
    width={110}
    height={38}
    style={{
      objectFit: 'contain',
      filter: 'brightness(0) invert(1)'
    }}
  />
) : (
  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <Image
      src="/imagotipo-gcc.svg"
      alt="GCC"
      width={28}
      height={28}
      style={{
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)'
      }}
    />
  </div>
)}

  {/* Toggle */}
  <button
    onClick={() => onToggle && onToggle()}
    title={collapsed ? 'Expandir menú' : 'Contraer menú'}
    style={{
      background: 'rgba(255,255,255,0.07)',
      border: 'none',
      color: 'rgba(255,255,255,0.6)',
      width: 28,
      height: 28,
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
      e.currentTarget.style.color = '#fff';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
    }}
  >
    {collapsed ? '▶' : '◀'}
  </button>

</div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0' }}>
        {NAV.map(({ section, items, isAI }) => (
          <div key={section} style={{ marginBottom: 6 }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.55rem',
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: isAI ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.25)',
                padding: '10px 16px 4px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {isAI ? '✦ ' : ''}{section}
              </div>
            )}
            {items.map(item => {
              const active = isActive(item.href);
              const badge  = item.badgeKey ? badges[item.badgeKey] : null;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '9px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    cursor: 'pointer',
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s',
                    background: active
                      ? (isAI ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.09)')
                      : 'transparent',
                    borderLeft: active
                      ? `3px solid ${isAI ? 'var(--purple)' : 'var(--red)'}`
                      : '3px solid transparent',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    width: 18,
                    textAlign: 'center',
                    color: item.badgeColor || 'inherit',
                  }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                      {badge !== null && badge !== undefined && (
                        <span style={{
                          background: item.badgeColor || 'var(--red)',
                          color: '#fff',
                          fontSize: '0.58rem',
                          padding: '1px 6px',
                          borderRadius: 99,
                          fontFamily: 'DM Mono, monospace',
                          flexShrink: 0,
                        }}>
                          {badge}
                        </span>
                      )}
                      {isAI && (
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: 'var(--purple)', flexShrink: 0,
                        }} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 30, height: 30,
              background: 'var(--red)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              flexShrink: 0, textTransform: 'uppercase',
            }}>
              {user?.nombre?.slice(0, 2) || user?.email?.slice(0, 2) || 'CO'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: '0.76rem', color: '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.nombre || user?.email || 'Usuario'}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>
                {user?.rol || 'comprador'}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer', fontSize: '1rem',
                padding: 4, flexShrink: 0, lineHeight: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              <LogOut />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}