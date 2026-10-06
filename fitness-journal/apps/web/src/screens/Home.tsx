import { useLiveQuery } from 'dexie-react-hooks';
import { SEED_EXERCISES, type Exercise, type SetLog } from '@fit/core';
import { repo } from '../db';
import { plannedSets, sessionForWeekday } from '../defaultPlan';
import { shiftISO, todayISO, weekDates } from '../lib/date';
import { leaderForDate } from '../lib/leaders';
import { useUI } from '../store';

export function HomeBackdrop() {
  const leader = leaderForDate();
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={leader.photo}
        alt=""
        className="h-full w-full scale-105 object-cover object-center
         object-[center_34%] brightness-[1.08]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/80" />
    </div>
  );
}

function setScore(s: SetLog) {
  if (s.weight && s.reps) return s.weight * s.reps;
  if (s.reps) return s.reps;
  if (s.seconds) return s.seconds;
  return 0;
}

function formatSet(s: SetLog, name: string) {
  if (s.weight != null && s.reps != null) return `${name} · ${s.weight} kg × ${s.reps}`;
  if (s.reps != null) return `${name} · ${s.reps} reps`;
  if (s.seconds != null) return `${name} · ${s.seconds}s`;
  return name;
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke="white" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">{pct}%</span>
    </div>
  );
}

export default function Home() {
  const go = useUI((s) => s.go);
  const today = todayISO();
  const yesterday = shiftISO(today, -1);
  const week = weekDates();
  const session = sessionForWeekday(new Date().getDay());
  const ySession = sessionForWeekday(new Date(yesterday + 'T12:00:00').getDay());
  const leader = leaderForDate();

  const doneDates = useLiveQuery(() => repo.getSetDates(week[0].date, week[6].date), [], [] as string[]);
  const todaySets = useLiveQuery(() => repo.getSetsByDate(today), [today], [] as SetLog[]);
  const ySets = useLiveQuery(() => repo.getSetsByDate(yesterday), [yesterday], [] as SetLog[]);
  const exercises = useLiveQuery(() => repo.getExercises(), [], [] as Exercise[]);
  const byId = new Map((exercises.length ? exercises : SEED_EXERCISES).map((e) => [e.id, e]));

  const total = session ? plannedSets(session.items) : 0;
  const done = todaySets.filter((s) => s.done).length;
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const bestY = ySets.filter((s) => s.done).sort((a, b) => setScore(b) - setScore(a))[0];
  const yHighlight = bestY
    ? formatSet(bestY, byId.get(bestY.exerciseId)?.name ?? 'Set')
    : ySession
      ? 'No sets logged yesterday.'
      : 'Rest day — nothing to log.';

  return (
    <div className="relative min-h-full text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">beOriginal</p>
      <p className="mt-3 text-sm text-white/75">{dateLabel}</p>

      <div className="my-6 flex justify-between">
        {week.map((d) => {
          const isToday = d.date === today;
          const isDone = doneDates.includes(d.date);
          const isRest = !sessionForWeekday(d.weekday);
          return (
            <div key={d.date} className={`w-9 text-center text-xs ${isToday ? 'font-bold text-white' : 'text-white/55'}`}>
              {d.label}
              <span
                className={`mx-auto mt-1 block h-[26px] w-[26px] rounded-full border-[1.5px] ${
                  isDone
                    ? 'border-white bg-white'
                    : isToday
                      ? 'border-2 border-white'
                      : isRest
                        ? 'border-dashed border-white/30'
                        : 'border-white/30'
                }`}
              />
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-lg-md">
        <p className="text-sm text-white/65">Today at a glance</p>
        {session ? (
          <>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{session.name}</h2>
            <p className="text-sm text-white/90">
              {session.items.map((i) => byId.get(i.exerciseId)?.name ?? i.exerciseId).join(' · ')}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing pct={pct} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{done} of {total} sets</p>
                <p className="text-sm text-white/60">{session.items.length} exercises</p>
              </div>
            </div>
            <button
              onClick={() => go('workout')}
              className="mt-4 w-full rounded-2xl bg-white py-3 font-semibold text-black"
            >
              {done > 0 ? "Continue today's workout" : "Open today's workout"}
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Rest day</h2>
            <p className="text-sm text-white/65">Nothing planned. Easy walk or ten minutes of mobility if you like.</p>
          </>
        )}
      </section>

      <blockquote className="mt-6 px-1">
        <p className="text-[1.05rem] leading-snug font-medium tracking-tight text-white/95">“{leader.quote}”</p>
        <footer className="mt-2 text-sm text-white/60">— {leader.name}</footer>
      </blockquote>

      <section className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
        <p className="text-sm text-white/65">Yesterday’s best part</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{yHighlight}</p>
      </section>
    </div>
  );
}
