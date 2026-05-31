import type { DayLog, AtomicMetrics } from "../types/log";

/**
 * Deterministic "charge" model, recomputed from the log every time.
 * - run on a normal day: +12
 * - run on a slammed/bad day: +25 (and counts toward badHeld)
 * - miss on a normal day: -6
 * - miss on a bad day: no penalty (life happened)
 * Charge is clamped to [0, 100].
 */
export function computeMetrics(atomicId: string, logs: DayLog[]): AtomicMetrics {
  let charge = 0;
  let badHeld = 0;
  let badTotal = 0;
  let ranDays = 0;
  let totalDays = 0;

  for (const entry of logs) {
    if (entry.atomicId !== atomicId || !entry.status) continue;
    totalDays++;
    if (entry.badDay) badTotal++;
    if (entry.status === "ran") {
      ranDays++;
      if (entry.badDay) {
        charge += 25;
        badHeld++;
      } else {
        charge += 12;
      }
    } else if (entry.status === "missed") {
      if (!entry.badDay) charge -= 6;
    }
  }

  charge = Math.max(0, Math.min(100, charge));
  const completion = totalDays ? Math.round((ranDays / totalDays) * 100) : 0;
  return { charge, badHeld, badTotal, completion, totalDays };
}

/** An atomic graduates once it is fully charged AND has held on 2+ hard days. */
export const isGraduated = (m: AtomicMetrics): boolean =>
  m.charge >= 100 && m.badHeld >= 2;
