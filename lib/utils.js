export function trunc(str, n = 30) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('es-MX');
}

export function statusColor(status) {
  const map = {
    atrasado:     'red',
    expeditacion: 'yellow',
    atiempo:      'green',
  };
  return map[status] || 'green';
}

export function statusLabel(status) {
  const map = {
    atrasado:     'Atrasada',
    expeditacion: 'Expeditar',
    atiempo:      'A Tiempo',
  };
  return map[status] || status;
}

export function pillClass(status) {
  const map = {
    atrasado:     'pill pill-red',
    expeditacion: 'pill pill-yellow',
    atiempo:      'pill pill-green',
  };
  return map[status] || 'pill pill-green';
}

export function daysBadge(days_diff) {
  const d = Number(days_diff);
  if (d < 0)  return { label: `${Math.abs(d)}d atraso`, cls: 'pill pill-red' };
  if (d <= 7) return { label: `${d}d`,                  cls: 'pill pill-yellow' };
  return              { label: `${d}d`,                  cls: 'pill pill-green' };
}