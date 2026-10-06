const pad = (n: number) => String(n).padStart(2, '0');

/** Local date as YYYY-MM-DD */
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => iso(new Date());

export function shiftISO(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + days);
  return iso(next);
}

/** Monday-first dates of the week containing `ref`. */
export function weekDates(ref = new Date()): { date: string; label: string; weekday: number }[] {
  const mondayOffset = (ref.getDay() + 6) % 7;
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map((label, i) => {
    const d = new Date(ref);
    d.setDate(ref.getDate() - mondayOffset + i);
    return { date: iso(d), label, weekday: d.getDay() };
  });
}
