import type { ExerciseType, SetLog } from './types';

export type PRKind = 'first' | 'weight' | 'reps' | 'time' | null;

export interface SetComparison {
  kind: PRKind;
  isPR: boolean;
  message: string;
  /** estimated 1RM change vs previous best, in percent (weight_reps only) */
  e1rmChangePct?: number;
}

type Attempt = Pick<SetLog, 'weight' | 'reps' | 'seconds'>;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Epley estimate. Only trusted for 1-10 reps; returns null otherwise. */
export function estimate1RM(weight: number, reps: number): number | null {
  if (!(weight > 0) || reps < 1 || reps > 10) return null;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

export function compareSet(type: ExerciseType, history: SetLog[], cur: Attempt): SetComparison {
  const prior = history.filter((s) => s.done);
  if (prior.length === 0) {
    return { kind: 'first', isPR: false, message: 'First log for this exercise' };
  }

  if (type === 'weight_reps') {
    const w = cur.weight ?? 0;
    const r = cur.reps ?? 0;
    const comparable = prior.filter((s) => (s.reps ?? 0) >= r && s.weight != null);
    const bestW = comparable.reduce((m, s) => Math.max(m, s.weight ?? 0), 0);

    const curE = estimate1RM(w, r);
    const bestE = prior.reduce((m, s) => Math.max(m, estimate1RM(s.weight ?? 0, s.reps ?? 0) ?? 0), 0);
    const e1rmChangePct = curE && bestE ? round1((curE / bestE - 1) * 100) : undefined;

    if (w > bestW) {
      const gain = comparable.length ? ` (+${round1(w - bestW)} kg)` : '';
      return { kind: 'weight', isPR: true, message: `New best: ${w} kg × ${r}${gain}`, e1rmChangePct };
    }
    return { kind: null, isPR: false, message: `Best at ${r}+ reps: ${bestW} kg`, e1rmChangePct };
  }

  if (type === 'timed') {
    const s = cur.seconds ?? 0;
    const best = prior.reduce((m, x) => Math.max(m, x.seconds ?? 0), 0);
    return s > best
      ? { kind: 'time', isPR: true, message: `New best: ${s} s (+${s - best} s)` }
      : { kind: null, isPR: false, message: `Best: ${best} s` };
  }

  const r = cur.reps ?? 0;
  const best = prior.reduce((m, x) => Math.max(m, x.reps ?? 0), 0);
  return r > best
    ? { kind: 'reps', isPR: true, message: `New best: ${r} reps (+${r - best})` }
    : { kind: null, isPR: false, message: `Best: ${best} reps` };
}
