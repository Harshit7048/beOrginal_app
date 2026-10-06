import Dexie, { type Table } from 'dexie';
import {
  SEED_EXERCISES,
  type BodyMetric, type Exercise, type Goal, type Plan, type Repo, type SetLog, type Video, type Workout,
} from '@fit/core';

class FitDB extends Dexie {
  exercises!: Table<Exercise, string>;
  plans!: Table<Plan, string>;
  workouts!: Table<Workout, string>;
  sets!: Table<SetLog, string>;
  bodyMetrics!: Table<BodyMetric, string>;
  goals!: Table<Goal, string>;
  videos!: Table<Video, string>;

  constructor() {
    super('fit');
    this.version(1).stores({
      exercises: 'id, type',
      plans: 'id',
      workouts: 'id, date',
      sets: 'id, exerciseId, date, workoutId',
      bodyMetrics: 'date',
      goals: 'id',
      videos: 'id, shortcode, *tags',
    });
  }
}

export const db = new FitDB();

export const repo: Repo = {
  getExercises: () => db.exercises.toArray(),
  getSets: (exerciseId) => db.sets.where('exerciseId').equals(exerciseId).toArray(),
  getSetsByDate: (date) => db.sets.where('date').equals(date).toArray(),
  getSetDates: async (from, to) => {
    const rows = await db.sets.where('date').between(from, to, true, true).toArray();
    return [...new Set(rows.filter((s) => s.done).map((s) => s.date))];
  },
  saveSet: async (set) => void (await db.sets.put(set)),
  deleteSet: (id) => db.sets.delete(id),
};

export async function seedIfEmpty() {
  if ((await db.exercises.count()) === 0) await db.exercises.bulkAdd(SEED_EXERCISES);
}
