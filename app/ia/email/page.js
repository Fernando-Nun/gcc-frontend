'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { ordenesAPI, iaAPI, correosAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { trunc } from '@/lib/utils';
import { Mail } from 'lucide-react';


export default function IAEmailPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ color: 'var(--muted)', padding: 20 }}>Cargando...</div>}>
        <IAEmailContent />
      </Suspense>
    </AppShell>
  );
}

function IAEmailContent() {
  const toast          = useToast();
  const searchParams   = useSearchParams();
  const supplierParam  = searchParams.get('supplier');

  const [ordenes,        setOrdenes]        = useState([]);
  const [seleccionadas,  setSeleccionadas]  = useState([]);
  const [correo,         setCorreo]         = useState('');
  const [loadingIA,      setLoadingIA]      = useState(false);
  const [enviando,       setEnviando]       = useState(false);
  const [copiado,        setCopiado]        = useState(false);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);

  useEffect(() => {
    if (!supplierParam) {
      setLoadingOrdenes(false);
      return;
    }
    setLoadingOrdenes(true);
    ordenesAPI.listar({
      supplier: supplierParam,
      matched: 'true',
      limit: 500,
      page: 1,
    })
      .then(d => {
        const data = d.data || [];
        setOrdenes(data);
        // Preseleccionar todas por default
        setSeleccionadas(data.map(o => `${o.po_id}-${o.id}`));
      })
      .catch(() => toast('Error al cargar órdenes', 'error'))
      .finally(() => setLoadingOrdenes(false));
  }, [supplierParam]);

  function ordenKey(o) { return `${o.po_id}-${o.id}`; }

  function toggleSeleccion(key) {
    setSeleccionadas(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  }

  function toggleTodas() {
    setSeleccionadas(prev =>
      prev.length === ordenes.length ? [] : ordenes.map(ordenKey)
    );
  }

  const ordsSeleccionadas = ordenes.filter(o => seleccionadas.includes(ordenKey(o)));

  async function generarCorreo() {
    if (seleccionadas.length === 0) {
      toast('Selecciona al menos una orden', 'warn');
      return;
    }
    setLoadingIA(true);
    setCorreo('');
    try {
      const { correo: text } = await iaAPI.redactarCorreo(ordsSeleccionadas);
      setCorreo(text);
      toast('✦ Correo generado con IA', 'ai');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoadingIA(false);
    }
  }

  async function enviarCorreo() {
    if (!correo) return;
    setEnviando(true);
    try {
      const { enviados } = await correosAPI.enviar(ordsSeleccionadas, null, correo);
      toast(`✉ ${enviados} correo(s) enviado(s)`, 'success');
      setSeleccionadas([]);
      setCorreo('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  async function copiarCorreo() {
    await navigator.clipboard.writeText(correo);
    setCopiado(true);
    toast('✓ Copiado al portapapeles', 'success');
    setTimeout(() => setCopiado(false), 2000);
  }

  const STATUS_LABEL = { atrasado: 'Atrasada', expeditacion: 'Expeditación', atiempo: 'A tiempo' };
  const STATUS_COLOR = { atrasado: 'var(--red)', expeditacion: 'var(--yellow)', atiempo: 'var(--green)' };

  // Pantalla de bienvenida si no hay supplier en URL
  if (!supplierParam) {
    return (
      <div>
        <AIHeader supplier={null} />
        <div className="card">
          <div className="card-body" style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 300, gap: 14, textAlign: 'center',
          }}>
            <span style={{ fontSize: '3rem' }}><Mail style={{ width: '2rem', height: '2rem', color: 'var(--muted)' }} /></span>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.4rem', letterSpacing: 2, color: 'var(--navy)',
            }}>
              SELECCIONA UN PROVEEDOR
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', maxWidth: 400 }}>
              Para redactar un correo, ve a la tabla de <strong>Órdenes</strong>, haz clic en
              cualquier orden y selecciona <strong>"Redactar Correo con IA"</strong>.
              Se cargarán automáticamente todas las órdenes de ese proveedor.
            </div>
            <a href="/ordenes?status=atrasado" className="btn btn-navy" style={{ marginTop: 8 }}>
              Ir a Órdenes →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AIHeader supplier={supplierParam} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Panel izquierdo — órdenes del proveedor */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              Órdenes de este proveedor
              <span style={{
                marginLeft: 8, fontSize: '0.65rem',
                color: 'var(--muted)', fontFamily: 'DM Mono, monospace',
              }}>
                ({ordenes.length})
              </span>
            </span>
            <button
              onClick={toggleTodas}
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.68rem' }}
            >
              {seleccionadas.length === ordenes.length && ordenes.length > 0 ? 'Ninguna' : 'Todas'}
            </button>
          </div>

          {seleccionadas.length > 0 && (
            <div style={{
              padding: '6px 14px',
              background: 'var(--navy-xlight)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.72rem',
              color: 'var(--navy)',
              fontWeight: 600,
            }}>
              {seleccionadas.length} orden{seleccionadas.length !== 1 ? 'es' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
            </div>
          )}

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loadingOrdenes ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <span className="spinner" style={{ margin: '0 auto', display: 'block', borderTopColor: 'var(--navy)' }} />
              </div>
            ) : ordenes.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
                Sin órdenes con datos de contacto para este proveedor
              </div>
            ) : ordenes.map(o => {
              const key   = ordenKey(o);
              const selec = seleccionadas.includes(key);
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '11px 16px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: selec ? 'var(--navy-xlight)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selec}
                    onChange={() => toggleSeleccion(key)}
                    style={{ accentColor: 'var(--navy)', marginTop: 3, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>
                        PO {o.po_id}
                      </span>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 600, flexShrink: 0,
                        color: STATUS_COLOR[o.status] || 'var(--muted)',
                      }}>
                        {STATUS_LABEL[o.status] || o.status}
                        {o.status === 'atrasado' && ` · ${Math.abs(o.days_diff)}d`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: 2 }}>
                      {trunc(o.item, 38)} · Qty {o.qty}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                      {o.planta} · {o.buyer} · Need By: {o.need_by}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={generarCorreo}
              disabled={loadingIA || seleccionadas.length === 0}
              className="btn btn-ai"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loadingIA
                ? <><span className="spinner" />Generando con IA...</>
                : <><span>✦</span> Generar Correo ({seleccionadas.length} orden{seleccionadas.length !== 1 ? 'es' : ''})</>
              }
            </button>
          </div>
        </div>

        {/* Panel derecho — preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-header-title">Vista previa del correo</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={copiarCorreo}
                disabled={!correo}
                className="btn btn-ghost"
                style={{ padding: '4px 10px', fontSize: '0.68rem' }}
              >
                {copiado ? '✓ Copiado' : 'Copiar'}
              </button>
              <button
                onClick={enviarCorreo}
                disabled={!correo || enviando}
                className="btn btn-navy"
                style={{ padding: '5px 14px', fontSize: '0.72rem', letterSpacing: 1 }}
              >
                {enviando ? <><span className="spinner" />Enviando...</> : '✉ Enviar'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: 16 }}>
            {loadingIA ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 300, gap: 14, color: 'var(--purple)',
              }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span style={{ fontSize: '0.82rem' }}>Generando correo con IA...</span>
              </div>
            ) : correo ? (
              <textarea
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                style={{
                  width: '100%', minHeight: 340,
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 4, padding: 18,
                  fontSize: '0.82rem', lineHeight: 1.8,
                  color: 'var(--text)',
                  fontFamily: 'DM Mono, monospace',
                  resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 300, gap: 12,
                color: 'var(--muted)', textAlign: 'center',
              }}>
                <span style={{ fontSize: '2rem' }}><Mail style={{ width: '2rem', height: '2rem', color: 'var(--muted)' }} /></span>
                <span style={{ fontSize: '0.82rem' }}>
                  Selecciona las órdenes que quieres incluir<br />y haz clic en "Generar Correo"
                </span>
              </div>
            )}
          </div>

          {ordsSeleccionadas.length > 0 && correo && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              background: 'var(--navy-xlight)',
              fontSize: '0.72rem',
              color: 'var(--navy)',
              lineHeight: 1.6,
            }}>
              <strong>Se enviará a:</strong>{' '}
              {[...new Set(ordsSeleccionadas.map(o => o.sup_email))].join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIHeader({ supplier }) {
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
        <Mail />
      </div>
      <div>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.8rem', letterSpacing: 2, color: 'var(--navy)',
        }}>
          REDACTAR CORREO
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {supplier ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Proveedor: <strong style={{ color: 'var(--navy)' }}>{supplier}</strong>
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Selecciona un proveedor desde la tabla de órdenes
            </span>
          )}
          <span className="ai-badge">✦ GPT-4o mini</span>
        </div>
      </div>
    </div>
  );
}