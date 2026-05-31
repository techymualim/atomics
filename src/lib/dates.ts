const pad = (n: number): string => String(n).padStart(2, "0");

export const toDateString = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = (): string => toDateString(new Date());

export const lastNDates = (n: number): string[] => {
  const out: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(toDateString(d));
  }
  return out;
};
