import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { compareSet, type Exercise, type PlanItem, type SetLog } from '@fit/core';
import { repo } from '../db';
import { plannedSets, sessionForWeekday } from '../defaultPlan';
import { todayISO } from '../lib/date';
import { useUI } from '../store';

type Vals = { weight?: number; reps?: number; seconds?: number };

const setId = (date: string, exerciseId: string, idx: number) => `${date}:${exerciseId}:${idx}`;

function targetVals(item: PlanItem): Vals {
  return { weight: item.targetLoad, reps: item.targetReps, seconds: item.targetSeconds };
}

function NumberField({ value, unit, onChange }: { value?: number; unit: string; onChange: (n?: number) => void }) {
  return (
    <label className="flex items-center gap-1 rounded-lg border border-ln bg-cd px-2 py-1 text-sm">
      <input
        type="number" inputMode="decimal" value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="w-12 bg-transparent text-right outline-none"
      />
      <span className="text-mu">{unit}</span>
    </label>
  );
}

export default function Workout() {
  const go = useUI((s) => s.go);
  const date = todayISO();
  const session = sessionForWeekday(new Date().getDay());
  const [vals, setVals] = useState<Record<string, Vals>>({});
  const [toast, setToast] = useState<string | null>(null);

  const exercises = useLiveQuery(() => repo.getExercises(), [], [] as Exercise[]);
  const todaySets = useLiveQuery(() => repo.getSetsByDate(date), [date], [] as SetLog[]);
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const doneIds = useMemo(() => new Set(todaySets.filter((s) => s.done).map((s) => s.id)), [todaySets]);

  if (!session) {
    return <p className="text-sm text-mu">Rest day. Nothing to log.</p>;
  }

  const total = plannedSets(session.items);
  const pct = total ? Math.round((doneIds.size / total) * 100) : 0;

  const valuesFor = (item: PlanItem, idx: number): Vals => vals[setId(date, item.exerciseId, idx)] ?? targetVals(item);
  const setValue = (item: PlanItem, idx: number, patch: Vals) =>
    setVals((v) => ({ ...v, [setId(date, item.exerciseId, idx)]: { ...valuesFor(item, idx), ...patch } }));

  async function toggle(item: PlanItem, idx: number) {
    const id = setId(date, item.exerciseId, idx);
    if (doneIds.has(id)) return repo.deleteSet(id);

    const ex = byId.get(item.exerciseId);
    if (!ex) return;
    const v = valuesFor(item, idx);
    const history = await repo.getSets(item.exerciseId);
    const result = compareSet(ex.type, history, v);

    await repo.saveSet({
      id, workoutId: date, exerciseId: item.exerciseId, idx, date,
      weight: v.weight, reps: v.reps, seconds: v.seconds, done: true, createdAt: Date.now(),
    });
    if (result.isPR) {
      setToast(result.message);
      setTimeout(() => setToast(null), 2200);
    }
  }

  return (
    <div className="relative">
      <button onClick={() => go('home')} className="pb-2 text-sm text-mu">&larr; Back</button>
      <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
      <p className="text-sm text-mu">{doneIds.size} of {total} sets</p>
      <div className="my-3 h-[5px] overflow-hidden rounded bg-ln">
        <div className="h-full bg-ac transition-all" style={{ width: `${pct}%` }} />
      </div>

      {session.items.map((item) => {
        const ex = byId.get(item.exerciseId);
        if (!ex) return null;
        return (
          <section key={item.exerciseId} className="border-b border-ln py-4">
            <h2 className="font-semibold">{ex.name}</h2>
            {Array.from({ length: item.sets }, (_, idx) => {
              const id = setId(date, item.exerciseId, idx);
              const on = doneIds.has(id);
              const v = valuesFor(item, idx);
              return (
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <button
                    onClick={() => toggle(item, idx)}
                    aria-label={`Set ${idx + 1} ${on ? 'done' : 'not done'}`}
                    aria-pressed={on}
                    className={`h-7 w-7 flex-none rounded-full border-[1.5px] text-sm ${
                      on ? 'border-ac bg-ac text-on' : 'border-ln'
                    }`}
                  >
                    {on ? '\u2713' : ''}
                  </button>
                  <span className="w-12 text-sm text-mu">Set {idx + 1}</span>
                  {ex.type === 'weight_reps' && (
                    <>
                      <NumberField value={v.weight} unit="kg" onChange={(n) => setValue(item, idx, { weight: n })} />
                      <NumberField value={v.reps} unit="reps" onChange={(n) => setValue(item, idx, { reps: n })} />
                    </>
                  )}
                  {ex.type === 'reps' && (
                    <NumberField value={v.reps} unit="reps" onChange={(n) => setValue(item, idx, { reps: n })} />
                  )}
                  {ex.type === 'timed' && (
                    <NumberField value={v.seconds} unit="s" onChange={(n) => setValue(item, idx, { seconds: n })} />
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      <div
        role="status"
        className={`pointer-events-none fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-tx px-4 py-2 text-sm text-bg transition-opacity ${
          toast ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
