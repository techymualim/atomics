export function computeMetrics(atomicId, logs) {
  let charge = 0;
  let badHeld = 0;
  let badTotal = 0;
  let ranDays = 0;
  let totalDays = 0;

  (logs || []).forEach((entry) => {
    if (entry.atomic_id !== atomicId) return;
    totalDays++;
    if (entry.bad_day) badTotal++;
    if (entry.status === "ran") {
      ranDays++;
      if (entry.bad_day) {
        charge += 25;
        badHeld++;
      } else {
        charge += 12;
      }
    } else if (entry.status === "missed") {
      if (!entry.bad_day) charge -= 6;
    }
  });

  charge = Math.max(0, Math.min(100, charge));
  const completion = totalDays ? Math.round((ranDays / totalDays) * 100) : 0;
  return { charge, badHeld, badTotal, completion, totalDays };
}

export function isGraduated(metrics) {
  return metrics.charge >= 100 && metrics.badHeld >= 2;
}
