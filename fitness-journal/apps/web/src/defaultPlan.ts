import type { Plan, PlanItem } from '@fit/core';

const pull: PlanItem[] = [
  { exerciseId: 'pull-up', sets: 3, targetReps: 8 },
  { exerciseId: 'ring-row', sets: 3, targetReps: 10 },
  { exerciseId: 'hanging-leg-raise', sets: 3, targetReps: 8 },
];

/** Starter plan. The plan builder (phase 1) will replace this with user data. */
export const defaultPlan: Plan = {
  id: 'default',
  name: 'Starter week',
  sessions: [
    { weekday: 1, name: 'Pull + Skill', items: pull },
    {
      weekday: 2, name: 'Push + Mobility',
      items: [
        { exerciseId: 'bench-press', sets: 3, targetReps: 5, targetLoad: 60 },
        { exerciseId: 'shoulder-cars', sets: 2, targetSeconds: 30 },
        { exerciseId: 'handstand-hold', sets: 3, targetSeconds: 30 },
        { exerciseId: 'dips', sets: 1, targetReps: 10 },
      ],
    },
    {
      weekday: 4, name: 'Legs + Hips',
      items: [
        { exerciseId: 'back-squat', sets: 3, targetReps: 5, targetLoad: 60 },
        { exerciseId: 'hip-90-90', sets: 2, targetReps: 8 },
        { exerciseId: 'deep-squat-hold', sets: 2, targetSeconds: 30 },
      ],
    },
    { weekday: 5, name: 'Pull + Skill', items: pull },
    {
      weekday: 6, name: 'Full-body functional',
      items: [
        { exerciseId: 'turkish-get-up', sets: 3, targetReps: 3, targetLoad: 12 },
        { exerciseId: 'push-up', sets: 3, targetReps: 15 },
        { exerciseId: 'plank', sets: 3, targetSeconds: 45 },
      ],
    },
  ],
};

export const sessionForWeekday = (weekday: number) => defaultPlan.sessions.find((s) => s.weekday === weekday);
export const plannedSets = (items: PlanItem[]) => items.reduce((n, i) => n + i.sets, 0);
