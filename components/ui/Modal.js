'use client';
import { useEffect } from 'react';
import { statusLabel, pillClass, daysBadge, formatDate, trunc } from '@/lib/utils';

export default function Modal({ orden, onClose, onEnviarCorreo }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!orden) return null;

  const db = daysBadge(orden.days_diff);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,18,60,0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        padding: 20,
      }}
    >
      <div
        className="fade-up"
        style={{
          background: 'var(--surface)',
          width: 700,
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 10,
          boxShadow: '0 24px 80px rgba(10,18,60,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'var(--navy)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '10px 10px 0 0',
          gap: 12,
        }}>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.3rem',
              color: '#fff',
              letterSpacing: 2,
            }}>
              PO {orden.po_id}
              {orden.sap_id && (
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginLeft: 10, fontFamily: 'DM Mono, monospace' }}>
                  SAP {orden.sap_id}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={pillClass(orden.status)}>{statusLabel(orden.status)}</span>
              <span className={db.cls}>{db.label}</span>
              {orden.matched
                ? <span className="pill pill-green">✓ Con contacto</span>
                : <span className="pill pill-yellow">⚠ Sin contacto</span>
              }
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: 32, height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Orden */}
          <Section title="Datos de la Orden">
            <Grid>
              <Field label="Planta"      value={orden.planta}     mono />
              <Field label="Comprador"   value={orden.buyer}           />
              <Field label="Need By"     value={formatDate(orden.need_by)}   mono />
              <Field label="Order Date"  value={formatDate(orden.order_date)} mono />
              <Field label="Artículo"    value={orden.item}       full />
              <Field label="Cantidad"    value={orden.qty}        mono />
              {orden.comments && (
                <Field label="Comentarios" value={orden.comments} full />
              )}
            </Grid>
          </Section>

          {/* Proveedor */}
          <Section title="Datos del Proveedor">
            {orden.matched ? (
              <Grid>
                <Field label="Nombre Coupa"         value={orden.supplier}  full />
                <Field label="Nombre Supplier List" value={orden.sup_name}  full />
                <Field label="Ciudad"    value={orden.sup_city}   />
                <Field label="Teléfono"  value={orden.sup_phone}  mono />
                <Field label="Email"     value={
                  <span style={{
                    background: 'var(--green-light)',
                    color: 'var(--green)',
                    padding: '2px 10px',
                    borderRadius: 99,
                    fontSize: '0.75rem',
                    fontFamily: 'DM Mono, monospace',
                  }}>
                    ✓ {orden.sup_email}
                  </span>
                } full />
                {orden.sup_street && (
                  <Field label="Dirección" value={orden.sup_street} full />
                )}
              </Grid>
            ) : (
              <div style={{
                background: 'var(--yellow-light)',
                border: '1px solid rgba(232,134,10,0.25)',
                borderRadius: 6,
                padding: '14px 18px',
                fontSize: '0.82rem',
                color: 'var(--yellow)',
              }}>
                ⚠ Este proveedor no tiene coincidencia en el Supplier List. No es posible enviar correo automático.
              </div>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface2)',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          borderRadius: '0 0 10px 10px',
        }}>
          <button onClick={onClose} className="btn btn-ghost">
            Cerrar
          </button>
          <button
            onClick={() => orden.matched && onEnviarCorreo?.(orden)}
            disabled={!orden.matched}
            className="btn btn-navy"
          >
            ✉ {orden.matched ? 'Enviar Correo' : 'Sin Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: '0.6rem',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: 'var(--muted)',
        fontWeight: 600,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
    }}>
      {children}
    </div>
  );
}

function Field({ label, value, mono, full }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{
        fontSize: '0.6rem',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: 'var(--muted)',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: mono ? '0.8rem' : '0.85rem',
        color: mono ? 'var(--navy)' : 'var(--text)',
        fontFamily: mono ? 'DM Mono, monospace' : 'inherit',
        fontWeight: 500,
      }}>
        {value || '—'}
      </div>
    </div>
  );
}