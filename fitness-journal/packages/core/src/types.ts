export type ExerciseType = 'weight_reps' | 'reps' | 'timed' | 'distance' | 'skill' | 'rounds';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleTags: string[];
  equipment: string[];
}

export interface PlanItem {
  exerciseId: string;
  sets: number;
  targetReps?: number;
  targetSeconds?: number;
  targetLoad?: number;
}

/** weekday: 0 = Sunday ... 6 = Saturday (same as Date.getDay) */
export interface PlanSession {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  items: PlanItem[];
}

export interface Plan {
  id: string;
  name: string;
  sessions: PlanSession[];
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD (local)
  planSessionName?: string;
  notes?: string;
}

export interface SetLog {
  id: string;
  workoutId: string;
  exerciseId: string;
  idx: number;
  date: string; // YYYY-MM-DD (local)
  weight?: number;
  reps?: number;
  seconds?: number;
  distance?: number;
  rpe?: number;
  done: boolean;
  createdAt: number;
}

export interface BodyMetric {
  date: string;
  weightKg: number;
}

export interface Goal {
  id: string;
  metric: string;
  startValue: number;
  target: number;
  targetDate: string;
}

export interface Video {
  id: string;
  shortcode: string;
  url: string;
  author: string;
  caption?: string;
  collections: string[];
  tags: string[];
  note?: string;
  pinned: boolean;
  openCount: number;
  exerciseIds: string[];
  savedAt: number;
}
