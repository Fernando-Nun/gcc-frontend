'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { iaAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function IAResumenPage() {
  return <AppShell><IAResumenContent /></AppShell>;
}

function IAResumenContent() {
  const toast = useToast();
  const [opts, setOpts] = useState({
    atrasadas:       true,
    proveedores:     true,
    plantas:         true,
    compradores:     true,
    recomendaciones: false,
  });
  const [resumen,  setResumen]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [copiado,  setCopiado]  = useState(false);

  async function generar() {
    setLoading(true);
    setResumen('');
    try {
      const { resumen: text } = await iaAPI.resumenEjecutivo(opts);
      setResumen(text);
      toast('✦ Resumen generado correctamente', 'ai');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(resumen);
    setCopiado(true);
    toast('✓ Copiado al portapapeles', 'success');
    setTimeout(() => setCopiado(false), 2000);
  }

  const OPCIONES = [
    { key: 'atrasadas',       label: 'Estado general y órdenes atrasadas', icon: '📊' },
    { key: 'proveedores',     label: 'Análisis de proveedores críticos',    icon: '🏭' },
    { key: 'plantas',         label: 'Plantas con mayor afectación',        icon: '🏗' },
    { key: 'compradores',     label: 'Compradores responsables',            icon: '👤' },
    { key: 'recomendaciones', label: 'Recomendaciones de acción',           icon: '✅' },
  ];

  return (
    <div>
      <AIHeader
        icon="≡"
        title="RESUMEN EJECUTIVO"
        sub="Genera un análisis ejecutivo completo del estado actual de las compras"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* Configuración */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <span className="card-header-title">Secciones a incluir</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OPCIONES.map(({ key, label, icon }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: opts[key] ? 'var(--navy-xlight)' : 'transparent',
                  border: `1.5px solid ${opts[key] ? 'var(--border)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={opts[key]}
                  onChange={e => setOpts(o => ({ ...o, [key]: e.target.checked }))}
                  style={{ accentColor: 'var(--navy)', width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span style={{ color: 'var(--text2)' }}>{label}</span>
              </label>
            ))}

            <button
              onClick={generar}
              disabled={loading}
              className="btn btn-ai"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            >
              {loading
                ? <><span className="spinner" />Generando...</>
                : <><span>✦</span>Generar Resumen</>
              }
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">Resumen generado</span>
            <button
              onClick={copiar}
              disabled={!resumen}
              className="btn btn-ghost"
              style={{ padding: '4px 12px', fontSize: '0.7rem' }}
            >
              {copiado ? '✓ Copiado' : 'Copiar texto'}
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                gap: 14,
                color: 'var(--purple)',
              }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span style={{ fontSize: '0.82rem' }}>Analizando datos y generando resumen...</span>
              </div>
            ) : resumen ? (
              <div style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 4,
                padding: 20,
                fontSize: '0.83rem',
                lineHeight: 1.9,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)',
                minHeight: 300,
                fontFamily: 'DM Mono, monospace',
              }}>
                {resumen}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                gap: 12,
                color: 'var(--muted)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '2.5rem' }}>≡</span>
                <span style={{ fontSize: '0.82rem' }}>
                  Selecciona las secciones y haz clic<br />en "Generar Resumen"
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIHeader({ icon, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <div style={{
        width: 46, height: 46,
        background: 'var(--purple-light)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        border: '1.5px solid rgba(124,58,237,0.2)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', letterSpacing: 2, color: 'var(--navy)' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sub}</span>
          <span className="ai-badge">✦ GPT-4o mini</span>
        </div>
      </div>
    </div>
  );
}