import { describe, expect, it } from 'vitest';
import { compareSet, estimate1RM } from './progress';
import type { SetLog } from './types';

let n = 0;
const log = (p: Partial<SetLog>): SetLog => ({
  id: `s${n++}`, workoutId: 'w', exerciseId: 'x', idx: 0, date: '2026-01-01',
  done: true, createdAt: n, ...p,
});

describe('estimate1RM', () => {
  it('uses Epley for 1-10 reps', () => {
    expect(estimate1RM(95, 2)).toBeCloseTo(101.33, 1);
    expect(estimate1RM(100, 1)).toBe(100);
  });
  it('returns null outside the trusted range', () => {
    expect(estimate1RM(60, 15)).toBeNull();
    expect(estimate1RM(0, 5)).toBeNull();
  });
});

describe('compareSet: weight_reps', () => {
  it('flags the first ever log without a PR', () => {
    const r = compareSet('weight_reps', [], { weight: 95, reps: 2 });
    expect(r.kind).toBe('first');
    expect(r.isPR).toBe(false);
  });
  it('detects a weight PR at the same reps and reports e1RM change', () => {
    const r = compareSet('weight_reps', [log({ weight: 92.5, reps: 2 })], { weight: 95, reps: 2 });
    expect(r.isPR).toBe(true);
    expect(r.message).toBe('New best: 95 kg × 2 (+2.5 kg)');
    expect(r.e1rmChangePct).toBeCloseTo(2.7, 1);
  });
  it('compares against sets with the same or more reps', () => {
    const history = [log({ weight: 100, reps: 3 })];
    const r = compareSet('weight_reps', history, { weight: 95, reps: 2 });
    expect(r.isPR).toBe(false);
  });
  it('treats more reps than ever as a PR', () => {
    const r = compareSet('weight_reps', [log({ weight: 100, reps: 1 })], { weight: 90, reps: 3 });
    expect(r.isPR).toBe(true);
  });
  it('ignores sets that were not completed', () => {
    const r = compareSet('weight_reps', [log({ weight: 200, reps: 2, done: false })], { weight: 95, reps: 2 });
    expect(r.kind).toBe('first');
  });
});

describe('compareSet: timed and reps', () => {
  it('detects a hold-time PR', () => {
    const r = compareSet('timed', [log({ seconds: 30 })], { seconds: 35 });
    expect(r.isPR).toBe(true);
    expect(r.message).toBe('New best: 35 s (+5 s)');
  });
  it('does not flag equal holds', () => {
    expect(compareSet('timed', [log({ seconds: 35 })], { seconds: 35 }).isPR).toBe(false);
  });
  it('detects a rep PR for bodyweight work', () => {
    const r = compareSet('reps', [log({ reps: 7 })], { reps: 8 });
    expect(r.isPR).toBe(true);
    expect(r.message).toBe('New best: 8 reps (+1)');
  });
});
