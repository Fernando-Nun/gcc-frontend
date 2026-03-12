'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Paginacion from '@/components/ui/Paginacion';
import { correosAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { trunc } from '@/lib/utils';
import { Mail } from 'lucide-react';


export default function CorreosPage() {
  return <AppShell><CorreosContent /></AppShell>;
}

function CorreosContent() {
  const toast = useToast();
  const [correos,  setCorreos]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    correosAPI.historial(page)
      .then(d => {
        setCorreos(d.data || []);
        setTotal(d.count || 0);
      })
      .catch(() => toast('Error al cargar historial', 'error'))
      .finally(() => setLoading(false));
  }, [page]);

  function formatFecha(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2rem',
          letterSpacing: 3,
          color: 'var(--navy)',
          marginBottom: 4,
        }}>
          CORREOS ENVIADOS
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          Historial completo de correos enviados a proveedores
        </div>
      </div>

      {/* Stat rápido */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 18,
      }}>
        {[
          { label: 'Total enviados', value: total,  color: 'var(--navy)'  },
          { label: 'Esta semana',    value: '—',    color: 'var(--green)' },
          { label: 'Con error',      value: '—',    color: 'var(--red)'   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderTop: `3px solid ${color}`,
            borderRadius: 6,
            padding: '14px 18px',
          }}>
            <div style={{
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: 'var(--muted)',
              fontWeight: 600,
              marginBottom: 5,
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.8rem',
              color,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <span className="card-header-title">Registro de correos</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>PO ID</th>
                <th>Destinatario</th>
                <th>Email</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th>Resend ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>
                    <span className="spinner" style={{
                      margin: '0 auto',
                      display: 'block',
                      borderTopColor: 'var(--navy)',
                    }} />
                  </td>
                </tr>
              ) : correos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    textAlign: 'center',
                    padding: 40,
                    color: 'var(--muted)',
                    fontSize: '0.82rem',
                  }}>
                    <div style={{ marginBottom: 8, fontSize: '2rem' }}><Mail style={{ width: '2rem', height: '2rem', color: 'var(--muted)' }} /></div>
                    No hay correos enviados todavía.<br />
                    Ve a <strong>Órdenes</strong> o <strong>Herramientas IA → Redactar Correos</strong> para enviar.
                  </td>
                </tr>
              ) : correos.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{
                    background: selected?.id === c.id ? 'var(--navy-xlight)' : undefined,
                  }}
                >
                  <td style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatFecha(c.enviado_en)}
                  </td>
                  <td style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.72rem',
                    color: 'var(--navy)',
                    fontWeight: 600,
                  }}>
                    {c.po_id}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {trunc(c.destinatario_nombre, 24)}
                  </td>
                  <td style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'var(--navy)',
                  }}>
                    {trunc(c.destinatario_email, 26)}
                  </td>
                  <td style={{ color: 'var(--text2)' }}>
                    {trunc(c.asunto, 36)}
                  </td>
                  <td>
                    <span className={`pill ${c.estado === 'enviado' ? 'pill-green' : 'pill-red'}`}>
                      {c.estado === 'enviado' ? '✓ Enviado' : '✗ Error'}
                    </span>
                  </td>
                  <td style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.65rem',
                    color: 'var(--muted)',
                  }}>
                    {trunc(c.resend_id, 16)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Paginacion total={total} page={page} limit={20} onPage={setPage} />
      </div>

      {/* Panel detalle del correo seleccionado */}
      {selected && (
        <div className="card fade-up" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-header-title">
              Contenido del correo — PO {selected.po_id}
            </span>
            <button
              onClick={() => setSelected(null)}
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
            >
              Cerrar ✕
            </button>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}>
              {[
                { label: 'PO ID',        value: selected.po_id,                mono: true  },
                { label: 'Enviado el',   value: formatFecha(selected.enviado_en), mono: true },
                { label: 'Destinatario', value: selected.destinatario_nombre              },
                { label: 'Email',        value: selected.destinatario_email,   mono: true  },
                { label: 'Asunto',       value: selected.asunto,               full: true  },
              ].map(({ label, value, mono, full }) => (
                <div key={label} style={full ? { gridColumn: '1 / -1' } : {}}>
                  <div style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: 'var(--muted)',
                    marginBottom: 3,
                    fontWeight: 600,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: mono ? '0.78rem' : '0.85rem',
                    fontFamily: mono ? 'DM Mono, monospace' : 'inherit',
                    color: mono ? 'var(--navy)' : 'var(--text)',
                    fontWeight: 500,
                  }}>
                    {value || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Cuerpo del correo */}
            <div>
              <div style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: 'var(--muted)',
                marginBottom: 8,
                fontWeight: 600,
              }}>
                Cuerpo del correo
              </div>
              <div style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 4,
                padding: 18,
                fontSize: '0.82rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)',
                fontFamily: 'DM Mono, monospace',
                maxHeight: 320,
                overflowY: 'auto',
              }}>
                {selected.cuerpo || '— Sin cuerpo registrado —'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}