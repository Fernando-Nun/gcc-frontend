'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ordenesAPI, iaAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { trunc, formatDate } from '@/lib/utils';

const RIESGO = {
  alto:  { label: 'ALTO',  bg: 'var(--red-light)',    color: 'var(--red)'    },
  medio: { label: 'MEDIO', bg: 'var(--yellow-light)',  color: 'var(--yellow)' },
  bajo:  { label: 'BAJO',  bg: 'var(--green-light)',   color: 'var(--green)'  },
};

export default function IARiesgoPage() {
  return <AppShell><IARiesgoContent /></AppShell>;
}

function IARiesgoContent() {
  const toast = useToast();
  const [ordenes,     setOrdenes]     = useState([]);
  const [predicciones, setPredicciones] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [filtro,      setFiltro]      = useState('all');

  useEffect(() => {
    ordenesAPI.listar({ status: 'atiempo', limit: 30 })
      .then(d => setOrdenes(d.data || []))
      .catch(() => toast('Error al cargar órdenes', 'error'));
  }, []);

  async function analizar() {
    if (ordenes.length === 0) {
      toast('No hay órdenes a tiempo para analizar', 'warn');
      return;
    }
    setLoading(true);
    setPredicciones([]);
    try {
      const { predicciones: p } = await iaAPI.predecirRiesgo(ordenes);
      setPredicciones(p);
      toast(`✦ ${p.length} órdenes analizadas`, 'ai');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const predFiltradas = filtro === 'all'
    ? predicciones
    : predicciones.filter(p => p.riesgo === filtro);

  const conteos = {
    alto:  predicciones.filter(p => p.riesgo === 'alto').length,
    medio: predicciones.filter(p => p.riesgo === 'medio').length,
    bajo:  predicciones.filter(p => p.riesgo === 'bajo').length,
  };

  return (
    <div>
      <AIHeader
        icon="⚠"
        title="PREDICCIÓN DE RIESGO"
        sub="Identifica órdenes en riesgo de atrasarse antes de que ocurra"
      />

      {/* KPI + botón */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr auto',
        gap: 12,
        marginBottom: 18,
        alignItems: 'stretch',
      }}>
        {['alto', 'medio', 'bajo'].map(nivel => {
          const r = RIESGO[nivel];
          return (
            <div
              key={nivel}
              onClick={() => setFiltro(filtro === nivel ? 'all' : nivel)}
              style={{
                background: r.bg,
                border: `1.5px solid ${r.color}33`,
                borderRadius: 8,
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                outline: filtro === nivel ? `2px solid ${r.color}` : 'none',
              }}
            >
              <div style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: r.color,
                fontWeight: 600,
                marginBottom: 6,
              }}>
                Riesgo {r.label}
              </div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '2.8rem',
                color: r.color,
                lineHeight: 1,
              }}>
                {predicciones.length > 0 ? conteos[nivel] : '—'}
              </div>
            </div>
          );
        })}

        <button
          onClick={analizar}
          disabled={loading || ordenes.length === 0}
          className="btn btn-ai"
          style={{
            flexDirection: 'column',
            gap: 4,
            padding: '16px 20px',
            alignSelf: 'stretch',
            height: 'auto',
          }}
        >
          {loading
            ? <><span className="spinner" style={{ width: 20, height: 20 }} /><span style={{ fontSize: '0.7rem' }}>Analizando...</span></>
            : <><span style={{ fontSize: '1.2rem' }}>✦</span><span style={{ fontSize: '0.72rem', letterSpacing: 1 }}>ANALIZAR</span></>
          }
        </button>
      </div>

      {/* Lista de predicciones */}
      <div className="card">
        <div className="card-header">
          <span className="card-header-title">
            Predicciones de riesgo
            {filtro !== 'all' && (
              <span style={{
                marginLeft: 10,
                background: RIESGO[filtro]?.bg,
                color: RIESGO[filtro]?.color,
                padding: '1px 8px',
                borderRadius: 99,
                fontSize: '0.6rem',
                fontWeight: 600,
              }}>
                Filtro: {RIESGO[filtro]?.label}
              </span>
            )}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            {ordenes.length} órdenes "a tiempo" analizadas
          </span>
        </div>

        <div style={{ padding: '0 0 8px' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 260,
              gap: 14,
              color: 'var(--purple)',
            }}>
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <span style={{ fontSize: '0.82rem' }}>Analizando historial de proveedores con IA...</span>
            </div>
          ) : predFiltradas.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 260,
              gap: 12,
              color: 'var(--muted)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '2.5rem' }}>⚠</span>
              <span style={{ fontSize: '0.82rem' }}>
                {predicciones.length === 0
                  ? 'Haz clic en "Analizar" para predecir riesgos'
                  : 'Sin órdenes con ese nivel de riesgo'
                }
              </span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              padding: 14,
            }}>
              {predFiltradas
                .sort((a, b) => (b.porcentaje || 0) - (a.porcentaje || 0))
                .map(p => {
                  const r = RIESGO[p.riesgo] || RIESGO.bajo;
                  const orden = ordenes.find(o => o.po_id === p.po_id);
                  return (
                    <div
                      key={p.po_id}
                      style={{
                        background: 'var(--surface)',
                        border: `1.5px solid ${r.color}33`,
                        borderLeft: `4px solid ${r.color}`,
                        borderRadius: 6,
                        padding: '14px 16px',
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Porcentaje */}
                      <div style={{
                        width: 50, height: 50,
                        borderRadius: '50%',
                        background: r.bg,
                        border: `2px solid ${r.color}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        flexDirection: 'column',
                      }}>
                        <div style={{
                          fontFamily: 'Bebas Neue, sans-serif',
                          fontSize: '1rem',
                          color: r.color,
                          lineHeight: 1,
                        }}>
                          {p.porcentaje || 0}%
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 3,
                        }}>
                          <span style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.68rem',
                            color: 'var(--muted)',
                          }}>
                            PO {p.po_id}
                          </span>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            color: r.color,
                            background: r.bg,
                            padding: '1px 8px',
                            borderRadius: 99,
                          }}>
                            {r.label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--text)',
                          marginBottom: 2,
                        }}>
                          {trunc(orden?.sup_name || orden?.supplier, 32)}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--muted)',
                          marginBottom: 4,
                        }}>
                          Need By: {formatDate(orden?.need_by)} · {orden?.days_diff}d restantes
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--text2)',
                          lineHeight: 1.4,
                          borderTop: '1px solid var(--border)',
                          paddingTop: 4,
                        }}>
                          {p.razon}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
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
          <span className="ai-badge">✦ GPT-5.4</span>
        </div>
      </div>
    </div>
  );
}