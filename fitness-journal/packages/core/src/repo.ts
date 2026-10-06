import type { Exercise, SetLog } from './types';

/**
 * Storage boundary. The web app implements this with Dexie (IndexedDB);
 * a future native app can implement it with SQLite without touching core.
 */
export interface Repo {
  getExercises(): Promise<Exercise[]>;
  getSets(exerciseId: string): Promise<SetLog[]>;
  getSetsByDate(date: string): Promise<SetLog[]>;
  getSetDates(from: string, to: string): Promise<string[]>;
  saveSet(set: SetLog): Promise<void>;
  deleteSet(id: string): Promise<void>;
}
