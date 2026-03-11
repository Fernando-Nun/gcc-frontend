'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ordenesAPI, iaAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { trunc } from '@/lib/utils';

const CATEGORIAS = {
  confirmado:     { label: '✓ Confirmado',     bg: 'var(--green-light)',   color: 'var(--green)'   },
  logistica:      { label: '🚚 Logística',      bg: 'var(--yellow-light)',  color: 'var(--yellow)'  },
  sin_respuesta:  { label: '✗ Sin respuesta',   bg: 'var(--red-light)',     color: 'var(--red)'     },
  pendiente:      { label: '⏳ Pendiente',       bg: 'var(--navy-light)',    color: 'var(--navy)'    },
  sin_clasificar: { label: '? Sin clasificar',  bg: 'var(--surface2)',      color: 'var(--muted)'   },
};

export default function IAComentariosPage() {
  return <AppShell><IAComentariosContent /></AppShell>;
}

function IAComentariosContent() {
  const toast = useToast();
  const [comentarios,    setComentarios]    = useState([]);
  const [clasificados,   setClasificados]   = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);

  useEffect(() => {
    setLoadingOrdenes(true);
    ordenesAPI.listar({ limit: 100 })
      .then(d => {
        const conComentarios = (d.data || []).filter(o => o.comments?.trim());
        setComentarios(conComentarios.slice(0, 30));
      })
      .catch(() => toast('Error al cargar comentarios', 'error'))
      .finally(() => setLoadingOrdenes(false));
  }, []);

  async function analizar() {
    if (comentarios.length === 0) {
      toast('No hay comentarios para analizar', 'warn');
      return;
    }
    setLoading(true);
    setClasificados([]);
    try {
      const items = comentarios.map(o => ({
        po_id:    o.po_id,
        supplier: o.supplier,
        comment:  o.comments,
      }));
      const { clasificaciones } = await iaAPI.analizarComentarios(items);
      setClasificados(clasificaciones);
      toast(`✦ ${clasificaciones.length} comentarios clasificados`, 'ai');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Conteo por categoría
  const conteos = Object.keys(CATEGORIAS).reduce((acc, k) => {
    acc[k] = clasificados.filter(c => c.categoria === k).length;
    return acc;
  }, {});

  return (
    <div>
      <AIHeader
        icon="◈"
        title="ANÁLISIS DE COMENTARIOS"
        sub="Clasifica automáticamente los comentarios del reporte usando inteligencia artificial"
      />

      {/* Resumen de categorías (solo si hay resultados) */}
      {clasificados.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}>
          {Object.entries(CATEGORIAS).map(([key, { label, bg, color }]) => (
            <div key={key} style={{
              background: bg,
              border: `1.5px solid ${color}22`,
              borderRadius: 6,
              padding: '12px 14px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.8rem',
                color,
                lineHeight: 1,
              }}>
                {conteos[key]}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color,
                marginTop: 4,
                fontWeight: 600,
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Panel izquierdo — comentarios raw */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              Comentarios del reporte ({comentarios.length})
            </span>
            <button
              onClick={analizar}
              disabled={loading || comentarios.length === 0}
              className="btn btn-ai"
              style={{ padding: '5px 14px', fontSize: '0.72rem', letterSpacing: 1 }}
            >
              {loading
                ? <><span className="spinner" />Analizando...</>
                : <><span>✦</span>Clasificar con IA</>
              }
            </button>
          </div>

          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {loadingOrdenes ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <span className="spinner" style={{ margin: '0 auto', display: 'block', borderTopColor: 'var(--navy)' }} />
              </div>
            ) : comentarios.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: '0.8rem',
              }}>
                No hay comentarios en las órdenes cargadas
              </div>
            ) : comentarios.map((o, i) => (
              <div
                key={o.po_id}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.68rem',
                    color: 'var(--muted)',
                  }}>
                    PO {o.po_id}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--text2)',
                  }}>
                    {trunc(o.supplier, 24)}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text)',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}>
                  "{trunc(o.comments, 120)}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — resultados */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">Resultados de clasificación</span>
          </div>

          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                gap: 14,
                color: 'var(--purple)',
              }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span style={{ fontSize: '0.82rem' }}>Clasificando con GPT-5.4...</span>
              </div>
            ) : clasificados.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                gap: 12,
                color: 'var(--muted)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '2.5rem' }}>◈</span>
                <span style={{ fontSize: '0.82rem' }}>
                  Haz clic en "Clasificar con IA"<br />para analizar los comentarios
                </span>
              </div>
            ) : clasificados.map(c => {
              const cat      = CATEGORIAS[c.categoria] || CATEGORIAS.sin_clasificar;
              const original = comentarios.find(o => o.po_id === c.po_id);
              return (
                <div
                  key={c.po_id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.68rem',
                      color: 'var(--muted)',
                    }}>
                      PO {c.po_id}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 99,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      background: cat.bg,
                      color: cat.color,
                      flexShrink: 0,
                    }}>
                      {cat.label}
                    </span>
                  </div>
                  {original && (
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--text2)',
                      fontStyle: 'italic',
                      marginBottom: 4,
                      lineHeight: 1.5,
                    }}>
                      "{trunc(original.comments, 100)}"
                    </div>
                  )}
                  {c.razon && (
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--muted)',
                      paddingTop: 4,
                      borderTop: '1px solid var(--border)',
                    }}>
                      → {c.razon}
                    </div>
                  )}
                </div>
              );
            })}
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
          <span className="ai-badge">✦ GPT-5.4</span>
        </div>
      </div>
    </div>
  );
}