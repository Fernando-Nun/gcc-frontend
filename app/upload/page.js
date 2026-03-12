'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { uploadAPI } from '@/lib/api';
import { FileSpreadsheet, Users  } from 'lucide-react';

export default function UploadPage() {
  return <AppShell><UploadContent /></AppShell>;
}

function UploadContent() {
  const router  = useRouter();
  const [coupaFile,     setCoupaFile]     = useState(null);
  const [suppliersFile, setSuppliersFile] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [resultado,     setResultado]     = useState(null);
  const [error,         setError]         = useState('');

  async function handleUpload() {
    if (!coupaFile || !suppliersFile) {
      setError('Selecciona ambos archivos antes de continuar');
      return;
    }
    setLoading(true);
    setResultado(null);
    setError('');
    try {
      const fd = new FormData();
      fd.append('coupa',     coupaFile);
      fd.append('suppliers', suppliersFile);
      const data = await uploadAPI.subir(fd);
      setResultado(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 860 }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2rem',
          letterSpacing: 3,
          color: 'var(--navy)',
          marginBottom: 4,
        }}>
          CARGAR ARCHIVOS
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          Sube el reporte de Coupa y el Supplier List para procesar y actualizar todas las órdenes
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 20,
      }}>
        <DropZone
          label="REPORTE COUPA"
          icon={<FileSpreadsheet />}
          desc="Archivo exportado desde Coupa con las órdenes de compra activas"
          accept=".xlsx,.csv,.xls"
          file={coupaFile}
          onChange={setCoupaFile}
        />
        <DropZone
          label="SUPPLIER LIST"
          icon={<Users />}
          desc="Archivo con datos de contacto de proveedores (Name 1, E-Mail Address, etc.)"
          accept=".xlsx,.csv,.xls"
          file={suppliersFile}
          onChange={setSuppliersFile}
        />
      </div>

      {error && (
        <div style={{
          background: 'var(--red-light)',
          border: '1px solid rgba(250,34,20,0.2)',
          color: 'var(--red)',
          padding: '12px 16px',
          borderRadius: 4,
          fontSize: '0.82rem',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !coupaFile || !suppliersFile}
        className="btn btn-navy"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '15px 20px',
          fontSize: '1.1rem',
          letterSpacing: 3,
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(25,43,141,0.25)',
        }}
      >
        {loading
          ? <><span className="spinner" /> PROCESANDO ARCHIVOS...</>
          : 'ANALIZAR Y PROCESAR DATOS →'
        }
      </button>

      {loading && (
        <div style={{
          background: 'var(--navy-xlight)',
          border: '1.5px solid var(--border)',
          borderRadius: 8,
          padding: '20px 24px',
          marginBottom: 24,
          fontSize: '0.82rem',
          color: 'var(--navy)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span className="spinner" style={{ borderTopColor: 'var(--navy)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Procesando archivos...</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
              Esto puede tardar 30–60 segundos dependiendo del tamaño del archivo. No cierres la página.
            </div>
          </div>
        </div>
      )}

      {resultado && (
        <div className="card fade-up">
          <div className="card-header">
            <span className="card-header-title">✓ Procesamiento completado</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-navy"
              style={{ padding: '6px 16px', fontSize: '0.75rem', letterSpacing: 1 }}
            >
              IR AL DASHBOARD →
            </button>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 16,
            }}>
              <StatBox label="Total órdenes"  value={resultado.total}        color="var(--navy)"   />
              <StatBox label="Atrasadas"       value={resultado.atrasadas}    color="var(--red)"    />
              <StatBox label="En expeditación" value={resultado.expeditacion} color="var(--yellow)" />
              <StatBox label="A tiempo"        value={resultado.a_tiempo}     color="var(--green)"  />
              <StatBox label="Con contacto"    value={resultado.con_contacto} color="var(--green)"  />
              <StatBox label="Sin contacto"    value={resultado.sin_contacto} color="var(--yellow)" />
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: 'var(--muted)',
                marginBottom: 6,
              }}>
                <span>Tasa de coincidencia con Supplier List</span>
                <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--navy)', fontWeight: 600 }}>
                  {resultado.total > 0
                    ? `${Math.round(resultado.con_contacto / resultado.total * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div style={{
                height: 8,
                background: 'var(--border)',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: resultado.total > 0
                    ? `${Math.round(resultado.con_contacto / resultado.total * 100)}%`
                    : '0%',
                  background: 'linear-gradient(90deg, var(--navy), var(--purple))',
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-header-title">Columnas requeridas</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ColList
              title="Reporte Coupa"
              cols={['PO ID', 'SAP ID PO', 'Supplier', 'Buyer', 'Planta', 'Item', 'Qty', 'Need By', 'Order Date (Header)', 'Comments']}
            />
            <ColList
              title="Supplier List"
              cols={['Name 1', 'City', 'Telephone 1', 'E-Mail Address', 'Street', 'Postal Code', 'Region']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DropZone({ label, icon, desc, accept, file, onChange }) {
  const [drag, setDrag] = useState(false);

  return (
    <label
      onDragOver={e  => { e.preventDefault(); setDrag(true);  }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onChange(f);
      }}
      style={{
        display: 'block',
        background: file ? 'var(--green-light)' : 'var(--surface)',
        border: `2px ${drag ? 'solid' : 'dashed'} ${
          file ? 'var(--green)' : drag ? 'var(--navy)' : 'var(--border)'
        }`,
        padding: '28px 22px',
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 8, height: 8, borderRadius: '50%',
        background: file ? 'var(--green)' : 'var(--border)',
        transition: 'background 0.2s',
      }} />
      <div style={{ fontSize: '2rem', marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '1rem', letterSpacing: 2,
        color: 'var(--navy)', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.73rem', color: 'var(--muted)',
        lineHeight: 1.6, marginBottom: file ? 10 : 0,
      }}>
        {desc}
      </div>
      {file && (
        <div style={{
          fontSize: '0.72rem', color: 'var(--green)',
          fontFamily: 'DM Mono, monospace',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>✓</span> {file.name}
        </div>
      )}
      <input
        type="file"
        accept={accept}
        hidden
        onChange={e => e.target.files[0] && onChange(e.target.files[0])}
      />
    </label>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1.5px solid var(--border)',
      borderRadius: 6,
      padding: '14px 16px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{
        fontSize: '0.62rem', textTransform: 'uppercase',
        letterSpacing: 1.5, color: 'var(--muted)',
        marginBottom: 6, fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '1.8rem', color, lineHeight: 1,
      }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function ColList({ title, cols }) {
  return (
    <div>
      <div style={{
        fontSize: '0.68rem', fontWeight: 600,
        color: 'var(--navy)', textTransform: 'uppercase',
        letterSpacing: 1.5, marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {cols.map(col => (
          <div key={col} style={{
            display: 'flex', alignItems: 'center',
            gap: 8, fontSize: '0.78rem', color: 'var(--text2)',
          }}>
            <span style={{ color: 'var(--green)', fontSize: '0.65rem' }}>✓</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{col}</span>
          </div>
        ))}
      </div>
    </div>
  );
}