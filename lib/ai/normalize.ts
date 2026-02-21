export function normalizeDeadline(raw: unknown) {
  const value = String(raw || '').trim();
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const dt = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(dt.getTime())) return value;
  }

  return '';
}
