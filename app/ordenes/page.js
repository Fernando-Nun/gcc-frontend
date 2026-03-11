'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Modal from '@/components/ui/Modal';
import Paginacion from '@/components/ui/Paginacion';
import { ordenesAPI, correosAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { pillClass, statusLabel, daysBadge, trunc, formatDate } from '@/lib/utils';

const LIMIT = 15;

export default function OrdenesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ color: 'var(--muted)', padding: 20 }}>Cargando...</div>}>
        <OrdenesContent />
      </Suspense>
    </AppShell>
  );
}

function OrdenesContent() {
  const sp     = useSearchParams();
  const toast  = useToast();
  const status = sp.get('status') || 'atrasado';

  const [tab,      setTab]      = useState('matched');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [ordenes,  setOrdenes]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Reset al cambiar status
  useEffect(() => {
    setPage(1);
    setSearch('');
    setSeleccionadas([]);
  }, [status]);

  // Cargar órdenes
  useEffect(() => {
    setLoading(true);
    ordenesAPI.listar({
      status,
      page,
      limit: LIMIT,
      matched: tab === 'matched' ? 'true' : 'false',
      ...(search ? { search } : {}),
    })
      .then(d => { setOrdenes(d.data || []); setTotal(d.count || 0); })
      .catch(() => toast('Error al cargar órdenes', 'error'))
      .finally(() => setLoading(false));
  }, [status, tab, page, search]);

  function toggleSeleccion(orden) {
    setSeleccionadas(prev =>
      prev.find(o => o.id === orden.id)
        ? prev.filter(o => o.id !== orden.id)
        : [...prev, orden]
    );
  }

  function toggleTodas() {
    if (seleccionadas.length === ordenes.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(ordenes.filter(o => o.matched));
    }
  }

  async function enviarSeleccionadas() {
    if (seleccionadas.length === 0) {
      toast('Selecciona al menos una orden', 'warn');
      return;
    }
    setEnviando(true);
    try {
      const { enviados, resultados } = await correosAPI.enviar(seleccionadas);
      const errores = resultados.filter(r => r.status === 'error').length;
      toast(
        `✓ ${enviados} correo(s) enviado(s)${errores > 0 ? ` · ${errores} error(es)` : ''}`,
        errores > 0 ? 'warn' : 'success'
      );
      setSeleccionadas([]);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  async function handleEnviarCorreo(orden) {
    try {
      await correosAPI.enviar([orden]);
      toast(`✓ Correo enviado a ${orden.sup_email}`, 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const STATUS_INFO = {
    atrasado:     { label: 'ÓRDENES ATRASADAS',    pillCls: 'pill pill-red'    },
    expeditacion: { label: 'EN EXPEDITACIÓN',       pillCls: 'pill pill-yellow' },
    atiempo:      { label: 'ÓRDENES A TIEMPO',      pillCls: 'pill pill-green'  },
  };
  const info = STATUS_INFO[status] || STATUS_INFO.atrasado;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 22,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2rem',
            letterSpacing: 3,
            color: 'var(--navy)',
            marginBottom: 6,
          }}>
            {info.label}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={info.pillCls}>{statusLabel(status)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {total} órden{total !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        {/* Acciones masivas */}
        {tab === 'matched' && seleccionadas.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--navy-light)',
            border: '1.5px solid var(--border)',
            borderRadius: 6,
            padding: '10px 16px',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 600 }}>
              {seleccionadas.length} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={enviarSeleccionadas}
              disabled={enviando}
              className="btn btn-navy"
              style={{ padding: '7px 16px', fontSize: '0.78rem', letterSpacing: 1 }}
            >
              {enviando
                ? <><span className="spinner" />Enviando...</>
                : `✉ Enviar ${seleccionadas.length} correo${seleccionadas.length !== 1 ? 's' : ''}`
              }
            </button>
            <button
              onClick={() => setSeleccionadas([])}
              className="btn btn-ghost"
              style={{ padding: '7px 12px', fontSize: '0.75rem' }}
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Tabs + búsqueda */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid var(--border)',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex' }}>
          {[
            ['matched',   'Con datos de contacto'],
            ['unmatched', '⚠ Sin datos de contacto'],
          ].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => { setTab(val); setPage(1); setSeleccionadas([]); }}
              style={{
                padding: '10px 20px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                cursor: 'pointer',
                color: tab === val ? 'var(--navy)' : 'var(--muted)',
                border: 'none',
                borderBottom: tab === val
                  ? '2px solid var(--navy)'
                  : '2px solid transparent',
                background: 'transparent',
                fontFamily: 'inherit',
                fontWeight: tab === val ? 600 : 400,
                marginBottom: -2,
                transition: 'all 0.18s',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar PO, proveedor, comprador..."
          className="input"
          style={{ width: 260, padding: '7px 12px', fontSize: '0.78rem' }}
        />
      </div>

      {/* Aviso sin contacto */}
      {tab === 'unmatched' && (
        <div style={{
          background: 'var(--yellow-light)',
          border: '1px solid rgba(232,134,10,0.25)',
          borderRadius: 4,
          padding: '10px 16px',
          fontSize: '0.76rem',
          color: 'var(--yellow)',
          marginBottom: 14,
        }}>
          ⚠ Estos proveedores no tienen coincidencia en el Supplier List. Revisa el archivo de proveedores o mapéalos manualmente.
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {tab === 'matched' && (
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={seleccionadas.length === ordenes.filter(o => o.matched).length && ordenes.length > 0}
                      onChange={toggleTodas}
                      style={{ accentColor: 'var(--red)', cursor: 'pointer' }}
                    />
                  </th>
                )}
                <th>PO ID</th>
                <th>SAP ID</th>
                <th>Proveedor Coupa</th>
                {tab === 'matched' && (
                  <>
                    <th>Supplier List</th>
                    <th>Ciudad</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                  </>
                )}
                <th>Comprador</th>
                <th>Planta</th>
                <th>Artículo</th>
                <th>Qty</th>
                <th>Need By</th>
                <th>Días</th>
                {tab === 'unmatched' && <th>Comentarios</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 32 }}>
                    <span className="spinner" style={{ margin: '0 auto', display: 'block', borderTopColor: 'var(--navy)' }} />
                  </td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: '0.82rem' }}>
                    Sin resultados
                  </td>
                </tr>
              ) : ordenes.map(o => {
                const db         = daysBadge(o.days_diff);
                const estaSelec  = seleccionadas.some(s => s.id === o.id);
                return (
                  <tr
                    key={`${o.po_id}-${o.id}`}
                    style={{ background: estaSelec ? 'var(--navy-xlight)' : undefined }}
                    onClick={() => setSelected(o)}
                  >
                    {tab === 'matched' && (
                      <td onClick={e => e.stopPropagation()}>
                        {o.matched && (
                          <input
                            type="checkbox"
                            checked={estaSelec}
                            onChange={() => toggleSeleccion(o)}
                            style={{ accentColor: 'var(--navy)', cursor: 'pointer' }}
                          />
                        )}
                      </td>
                    )}
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.po_id}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.sap_id || '—'}</td>
                    <td style={{ fontWeight: 600 }} title={o.supplier}>{trunc(o.supplier, 24)}</td>
                    {tab === 'matched' && (
                      <>
                        <td title={o.sup_name}>{trunc(o.sup_name, 22)}</td>
                        <td style={{ color: 'var(--text2)' }}>{o.sup_city || '—'}</td>
                        <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.71rem', color: 'var(--muted)' }}>{trunc(o.sup_phone, 16)}</td>
                        <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.71rem', color: 'var(--navy)' }} title={o.sup_email}>{trunc(o.sup_email, 24)}</td>
                      </>
                    )}
                    <td title={o.buyer}>{trunc(o.buyer, 18)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>{o.planta}</td>
                    <td title={o.item}>{trunc(o.item, 24)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.qty}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{formatDate(o.need_by)}</td>
                    <td><span className={db.cls}>{db.label}</span></td>
                    {tab === 'unmatched' && (
                      <td style={{ color: 'var(--muted)', fontSize: '0.73rem' }} title={o.comments}>{trunc(o.comments, 28)}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Paginacion total={total} page={page} limit={LIMIT} onPage={setPage} />
      </div>

      {selected && (
        <Modal
          orden={selected}
          onClose={() => setSelected(null)}
          onEnviarCorreo={handleEnviarCorreo}
        />
      )}
    </div>
  );
}