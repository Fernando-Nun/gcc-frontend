'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ordenesAPI, iaAPI, correosAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { trunc, formatDate } from '@/lib/utils';

export default function IAEmailPage() {
  return <AppShell><IAEmailContent /></AppShell>;
}

function IAEmailContent() {
  const toast = useToast();

  const [ordenes,      setOrdenes]      = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [correo,       setCorreo]       = useState('');
  const [loadingIA,    setLoadingIA]    = useState(false);
  const [enviando,     setEnviando]     = useState(false);
  const [copiado,      setCopiado]      = useState(false);

  useEffect(() => {
    ordenesAPI.listar({ status: 'atrasado', limit: 50, matched: 'true' })
      .then(d => setOrdenes(d.data || []))
      .catch(() => toast('Error al cargar órdenes', 'error'));
  }, []);

  function toggleSeleccion(po_id) {
    setSeleccionadas(prev =>
      prev.includes(po_id) ? prev.filter(x => x !== po_id) : [...prev, po_id]
    );
  }

  function toggleTodas() {
    setSeleccionadas(prev =>
      prev.length === ordenes.length ? [] : ordenes.map(o => o.po_id)
    );
  }

  async function generarCorreo() {
    if (seleccionadas.length === 0) {
      toast('Selecciona al menos una orden', 'warn');
      return;
    }
    setLoadingIA(true);
    setCorreo('');
    try {
      const ordsSelec = ordenes.filter(o => seleccionadas.includes(o.po_id));
      const { correo: text } = await iaAPI.redactarCorreo(ordsSelec);
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
      const ordsSelec = ordenes.filter(o => seleccionadas.includes(o.po_id));
      const { enviados } = await correosAPI.enviar(ordsSelec);
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

  return (
    <div>
      <AIHeader
        icon="✉"
        title="REDACTAR CORREOS"
        sub="Genera correos personalizados para proveedores con órdenes atrasadas usando IA"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
      }}>
        {/* Panel izquierdo — selector de órdenes */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-title">
              Órdenes atrasadas con contacto
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={toggleTodas} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.68rem' }}>
                {seleccionadas.length === ordenes.length ? 'Ninguna' : 'Todas'}
              </button>
            </div>
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {ordenes.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
                Sin órdenes atrasadas con contacto
              </div>
            ) : ordenes.map(o => {
              const selec = seleccionadas.includes(o.po_id);
              return (
                <label
                  key={o.po_id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '11px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: selec ? 'var(--navy-xlight)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selec}
                    onChange={() => toggleSeleccion(o.po_id)}
                    style={{ accentColor: 'var(--navy)', marginTop: 2, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 2,
                    }}>
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.68rem',
                        color: 'var(--muted)',
                      }}>
                        PO {o.po_id}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        color: 'var(--red)',
                        fontFamily: 'DM Mono, monospace',
                        flexShrink: 0,
                      }}>
                        {Math.abs(o.days_diff)}d atraso
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: 2,
                    }}>
                      {trunc(o.sup_name || o.supplier, 36)}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--muted)',
                    }}>
                      {trunc(o.item, 36)} · {o.planta}
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      color: 'var(--navy)',
                      fontFamily: 'DM Mono, monospace',
                      marginTop: 2,
                    }}>
                      {o.sup_email}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Botón generar */}
          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={generarCorreo}
              disabled={loadingIA || seleccionadas.length === 0}
              className="btn btn-ai"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loadingIA
                ? <><span className="spinner" />Generando con IA...</>
                : <><span>✦</span>Generar Correo ({seleccionadas.length} orden{seleccionadas.length !== 1 ? 'es' : ''})</>
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                gap: 14,
                color: 'var(--purple)',
              }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span style={{ fontSize: '0.82rem' }}>Generando correo con Gemini AI...</span>
              </div>
            ) : correo ? (
              <div style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 4,
                padding: 18,
                fontSize: '0.82rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)',
                minHeight: 300,
                fontFamily: 'DM Mono, monospace',
              }}>
                {correo}
              </div>
            ) : (
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
                <span style={{ fontSize: '2rem' }}>✉</span>
                <span style={{ fontSize: '0.82rem' }}>
                  Selecciona órdenes y haz clic en<br />"Generar Correo" para crear un correo personalizado
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 22,
    }}>
      <div style={{
        width: 46, height: 46,
        background: 'var(--purple-light)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        border: '1.5px solid rgba(124,58,237,0.2)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.8rem',
          letterSpacing: 2,
          color: 'var(--navy)',
        }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sub}</span>
          <span className="ai-badge">✦ Gemini AI</span>
        </div>
      </div>
    </div>
  );
}