'use client';

export default function Paginacion({ total, page, limit = 15, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  // Genera rango de páginas con elipsis
  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface2)',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
        {total > 0 ? `${start}–${end} de ${total} registros` : 'Sin resultados'}
      </span>
      <div style={{ display: 'flex', gap: 3 }}>
        <PageBtn label="←" onClick={() => onPage(page - 1)} disabled={page === 1} />
        {getPages().map((n, i) =>
          n === '...'
            ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: '0.8rem', lineHeight: '28px' }}>…</span>
            : <PageBtn key={n} label={n} onClick={() => onPage(n)} active={n === page} />
        )}
        <PageBtn label="→" onClick={() => onPage(page + 1)} disabled={page === totalPages} />
      </div>
    </div>
  );
}

function PageBtn({ label, onClick, active, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28,
        fontSize: '0.72rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1.5px solid var(--border)',
        borderRadius: 3,
        background: active ? 'var(--navy)' : 'var(--surface)',
        color: active ? '#fff' : disabled ? 'var(--muted)' : 'var(--text2)',
        transition: 'all 0.15s',
        fontFamily: 'DM Mono, monospace',
      }}
    >
      {label}
    </button>
  );
}