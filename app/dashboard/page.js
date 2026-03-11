'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Modal from '@/components/ui/Modal';
import Paginacion from '@/components/ui/Paginacion';
import { ordenesAPI, correosAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { pillClass, statusLabel, daysBadge, trunc, formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const LIMIT = 15;

export default function DashboardPage() {
  return <AppShell><DashboardContent /></AppShell>;
}

function DashboardContent() {
  const router  = useRouter();
  const toast   = useToast();

  const [stats,   setStats]   = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [tab,     setTab]     = useState('all');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

    // Cargar estadísticas solo si hay datos
    useEffect(() => {
    ordenesAPI.estadisticas()
        .then(data => {
        if (data.kpis.total > 0) setStats(data);
        })
        .catch(() => {});
    }, []);

    // Cargar órdenes solo si hay datos
    useEffect(() => {
    setLoading(true);
    const params = {
        page, limit: LIMIT,
        ...(tab !== 'all' ? { status: tab } : {}),
        ...(search ? { search } : {}),
    };
    ordenesAPI.listar(params)
        .then(d => {
        setOrdenes(d.data || []);
        setTotal(d.count || 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [page, tab, search]);

  async function handleEnviarCorreo(orden) {
    try {
      await correosAPI.enviar([orden]);
      toast(`✓ Correo enviado a ${orden.sup_email}`, 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const kpis = stats?.kpis || {};

  const DONUT = [
    { name: 'Atrasadas',    value: kpis.atrasado     || 0, color: 'var(--red)'    },
    { name: 'Expeditación', value: kpis.expeditacion || 0, color: 'var(--yellow)' },
    { name: 'A Tiempo',     value: kpis.atiempo      || 0, color: 'var(--green)'  },
  ];

  return (
    <div>
      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 18,
      }}>
        {[
          { label: 'Total Órdenes',    key: 'total',        color: 'var(--navy)',   href: null              },
          { label: 'Atrasadas',        key: 'atrasado',     color: 'var(--red)',    href: '/ordenes?status=atrasado'     },
          { label: 'En Expeditación',  key: 'expeditacion', color: 'var(--yellow)', href: '/ordenes?status=expeditacion' },
          { label: 'A Tiempo',         key: 'atiempo',      color: 'var(--green)',  href: '/ordenes?status=atiempo'      },
        ].map(({ label, key, color, href }) => (
          <div
            key={key}
            onClick={() => href && router.push(href)}
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderTop: `4px solid ${color}`,
              borderRadius: 8,
              padding: '18px 20px',
              cursor: href ? 'pointer' : 'default',
              transition: 'box-shadow 0.18s',
              boxShadow: '0 1px 4px rgba(25,43,141,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { if (href) e.currentTarget.style.boxShadow = '0 4px 16px rgba(25,43,141,0.12)'; }}
            onMouseLeave={e => { if (href) e.currentTarget.style.boxShadow = '0 1px 4px rgba(25,43,141,0.05)'; }}
          >
            <div style={{
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: 'var(--muted)',
              marginBottom: 8,
              fontWeight: 600,
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '3rem',
              lineHeight: 1,
              color,
              marginBottom: 4,
            }}>
              {kpis[key] ?? '—'}
            </div>
            {href && (
              <div style={{
                position: 'absolute',
                bottom: 14, right: 16,
                fontSize: '1rem',
                color: 'var(--border2)',
              }}>→</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Mini stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 18,
      }}>
        {[
          { label: 'Con Contacto',  value: kpis.con_contacto, color: 'var(--green)' },
          { label: 'Sin Contacto',  value: kpis.sin_contacto, color: 'var(--yellow)' },
          { label: 'Tasa de Atraso',
            value: kpis.total
              ? `${Math.round((kpis.atrasado || 0) / kpis.total * 100)}%`
              : '—',
            color: 'var(--red)',
          },
          { label: 'Match Rate',
            value: kpis.total
              ? `${Math.round((kpis.con_contacto || 0) / kpis.total * 100)}%`
              : '—',
            color: 'var(--navy)',
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 6,
            padding: '12px 16px',
          }}>
            <div style={{
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: 'var(--muted)',
              marginBottom: 4,
              fontWeight: 600,
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.6rem',
              color,
            }}>
              {value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 14,
        marginBottom: 14,
      }}>
        <ChartCard title="Top Proveedores — Órdenes Atrasadas">
          {stats?.topSuppliers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stats.topSuppliers}
                layout="vertical"
                margin={{ left: 4, right: 16 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: 'var(--muted)' }}
                  width={110}
                  tickFormatter={s => s.length > 16 ? s.slice(0, 16) + '…' : s}
                />
                <Tooltip
                  contentStyle={{ fontSize: '0.75rem', background: 'var(--navy-dark)', border: 'none', color: '#fff', borderRadius: 4 }}
                />
                <Bar dataKey="count" fill="var(--red)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Distribución de Estatus">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={DONUT}
                cx="50%" cy="45%"
                innerRadius={55}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
              >
                {DONUT.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: '0.75rem', background: 'var(--navy-dark)', border: 'none', color: '#fff', borderRadius: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DONUT.map(d => (
              <div key={d.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.75rem',
              }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: d.color,
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, color: 'var(--text2)' }}>{d.name}</span>
                <span style={{
                  fontFamily: 'DM Mono, monospace',
                  fontWeight: 600,
                  color: 'var(--text)',
                }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts row 2 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 18,
      }}>
        <ChartCard title="Atrasos por Planta">
          {stats?.topPlantas?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={stats.topPlantas}
                layout="vertical"
                margin={{ left: 4, right: 16 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{ fontSize: '0.75rem', background: 'var(--navy-dark)', border: 'none', color: '#fff', borderRadius: 4 }}
                />
                <Bar dataKey="count" fill="var(--navy)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Top Compradores — Atrasos">
          {stats?.topCompradores?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={stats.topCompradores}
                layout="vertical"
                margin={{ left: 4, right: 16 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: 'var(--muted)' }}
                  width={120}
                  tickFormatter={s => s.length > 18 ? s.slice(0, 18) + '…' : s}
                />
                <Tooltip
                  contentStyle={{ fontSize: '0.75rem', background: 'var(--navy-dark)', border: 'none', color: '#fff', borderRadius: 4 }}
                />
                <Bar dataKey="count" fill="var(--yellow)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* ── AI Quick Access ── */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <span className="card-header-title">✦ Herramientas de Inteligencia Artificial</span>
          <span className="ai-badge">GPT-5.4</span>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}>
            {[
              { icon: '✉', label: 'Redactar Correos',     sub: 'Genera correos personalizados',    href: '/ia/email',       color: 'var(--navy)'   },
              { icon: '≡', label: 'Resumen Ejecutivo',    sub: 'Análisis ejecutivo del reporte',   href: '/ia/resumen',     color: 'var(--navy)'   },
              { icon: '◈', label: 'Análisis Comentarios', sub: 'Clasifica comentarios con IA',     href: '/ia/comentarios', color: 'var(--purple)' },
              { icon: '⚠', label: 'Predicción de Riesgo', sub: 'Identifica órdenes en peligro',   href: '/ia/riesgo',      color: 'var(--yellow)' },
              { icon: '⬡', label: 'Asistente IA',         sub: 'Chat con datos del reporte',      href: '/ia/chat',        color: 'var(--purple)' },
            ].map(({ icon, label, sub, href, color }) => (
              <div
                key={href}
                onClick={() => router.push(href)}
                style={{
                  background: 'var(--purple-light)',
                  border: '1.5px solid rgba(124,58,237,0.15)',
                  borderRadius: 8,
                  padding: '16px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  borderTop: `3px solid ${color}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--purple-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{icon}</div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--navy)',
                  marginBottom: 4,
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--muted)',
                  lineHeight: 1.4,
                }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla de órdenes ── */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <span className="card-header-title">Todas las Órdenes</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Tabs */}
            {[
              ['all',         'Todas'],
              ['atrasado',    'Atrasadas'],
              ['expeditacion','Expeditación'],
              ['atiempo',     'A Tiempo'],
            ].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => { setTab(val); setPage(1); }}
                style={{
                  padding: '4px 12px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  border: '1.5px solid transparent',
                  borderRadius: 99,
                  background: tab === val ? 'var(--navy-light)' : 'transparent',
                  color: tab === val ? 'var(--navy)' : 'var(--muted)',
                  fontWeight: tab === val ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {lbl}
              </button>
            ))}
            {/* Search */}
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar PO, proveedor, comprador..."
              className="input"
              style={{ width: 240, padding: '6px 12px', fontSize: '0.78rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Estatus</th>
                <th>PO ID</th>
                <th>SAP ID</th>
                <th>Proveedor</th>
                <th>Email</th>
                <th>Comprador</th>
                <th>Planta</th>
                <th>Artículo</th>
                <th>Qty</th>
                <th>Need By</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                    <span className="spinner" style={{ margin: '0 auto', display: 'block', borderTopColor: 'var(--navy)' }} />
                  </td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: '0.82rem' }}>
                    Sin resultados — {total === 0 ? 'Carga un reporte primero' : 'Prueba otro filtro'}
                  </td>
                </tr>
              ) : ordenes.map(o => {
                const db = daysBadge(o.days_diff);
                return (
                  <tr key={`${o.po_id}-${o.id}`} onClick={() => setSelected(o)}>
                    <td><span className={pillClass(o.status)}>{statusLabel(o.status)}</span></td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.po_id}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.sap_id || '—'}</td>
                    <td style={{ fontWeight: 600 }} title={o.supplier}>{trunc(o.supplier, 22)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--navy)' }} title={o.sup_email}>{trunc(o.sup_email, 22)}</td>
                    <td title={o.buyer}>{trunc(o.buyer, 18)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>{o.planta}</td>
                    <td title={o.item}>{trunc(o.item, 22)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{o.qty}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>{formatDate(o.need_by)}</td>
                    <td><span className={db.cls}>{db.label}</span></td>
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

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-header-title">{title}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{
      height: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--muted)',
      fontSize: '0.78rem',
    }}>
      Sin datos — carga un reporte primero
    </div>
  );
}