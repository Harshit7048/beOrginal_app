import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, repo } from '../db';
import { defaultPlan } from '../defaultPlan';
import { useUI, type StyleName } from '../store';

// Preset workout plan templates for upload modal
const PRESET_PLANS = [
  {
    id: 'ppl-5day',
    name: '5-Day Push / Pull / Legs Hypertrophy',
    description: 'High volume split focused on muscle growth and progressive overload.',
    sessionsCount: 5,
  },
  {
    id: 'strength-4day',
    name: '4-Day Athletic Strength & Power',
    description: 'Focus on compound lifts (Deadlift, Squat, Bench) and explosive power.',
    sessionsCount: 4,
  },
  {
    id: 'mobility-3day',
    name: '3-Day Full Body & Mobility',
    description: 'Ideal for recovery, endurance, joint health and functional movement.',
    sessionsCount: 3,
  },
];

export default function Me() {
  const { style, setStyle } = useUI();
  const [chartTab, setChartTab] = useState<'volume' | 'frequency' | 'prs'>('volume');
  
  // Modal states
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showReviewPlanModal, setShowReviewPlanModal] = useState(false);
  const [showUploadPlanModal, setShowUploadPlanModal] = useState(false);

  // Measure form state
  const [weight, setWeight] = useState('74.5');
  const [bodyFat, setBodyFat] = useState('13.8');
  const [chest, setChest] = useState('102');
  const [waist, setWaist] = useState('79');
  const [arms, setArms] = useState('38');
  const [metricSavedToast, setMetricSavedToast] = useState(false);

  // Upload plan notification state
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Dexie live queries
  const bodyMetrics = useLiveQuery(() => db.bodyMetrics.toArray(), [], []);
  const latestMetric = bodyMetrics && bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
  const currentWeight = latestMetric ? latestMetric.weightKg : 74.5;

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!isNaN(w)) {
      const todayDate = new Date().toISOString().split('T')[0];
      await db.bodyMetrics.put({ date: todayDate, weightKg: w });
    }
    setShowMeasureModal(false);
    setMetricSavedToast(true);
    setTimeout(() => setMetricSavedToast(false), 2500);
  };

  const handleSelectPresetPlan = (planName: string) => {
    setShowUploadPlanModal(false);
    setUploadToast(`Applied: ${planName}`);
    setTimeout(() => setUploadToast(null), 3000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header & Theme Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Me</h1>
          
        </div>
        <div className="flex gap-1 rounded-lg border border-ln bg-cd p-1 text-xs">
          {(['paper', 'midnight', 'sage'] as StyleName[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`capitalize px-2 py-0.5 rounded transition-all ${
                style === s ? 'bg-ac text-on font-semibold shadow-xs' : 'text-mu hover:text-tx'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TOP SECTION: Profile + Progress Chart (Grid on desktop / Stack on mobile) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        {/* PROFILE CARD */}
        <div className="sm:col-span-5 rounded-2xl border border-ln bg-cd p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-ac/30 shadow-md">
              <img
                src="/user_avatar.png"
                alt="User Profile Avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback avatar if image loading fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-bold tracking-tight">Harshit Bhardwaj</h2>
                <span className="rounded-full bg-ac/10 px-2 py-0.5 text-[10px] font-semibold text-ac">PRO</span>
              </div>
              <p className="text-xs text-mu truncate">Hybrid Athlete • Level 14</p>
              <p className="mt-1 text-[11px] font-medium text-ac">🔥 14 day active streak</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-ln border-t border-ln pt-3 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-mu">Weight</p>
              <p className="text-sm font-bold">{currentWeight} <span className="text-[10px] font-normal text-mu">kg</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-mu">Workouts</p>
              <p className="text-sm font-bold">52</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-mu">PRs</p>
              <p className="text-sm font-bold text-ac">18</p>
            </div>
          </div>
        </div>

        {/* PROGRESS CHART CARD */}
        <div className="sm:col-span-7 rounded-2xl border border-ln bg-cd p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-mu">Progress Chart</h3>
              <p className="text-sm font-bold text-ac">+18.4% volume gain this month</p>
            </div>
            <div className="flex rounded-md border border-ln p-0.5 text-[11px]">
              {(['volume', 'frequency', 'prs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`capitalize px-2 py-0.5 rounded transition-all ${
                    chartTab === tab ? 'bg-ac text-on font-semibold' : 'text-mu'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Progress Curve Visual */}
          <div className="relative mt-3 h-24 w-full">
            <svg viewBox="0 0 300 80" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ac)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--ac)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="var(--ln)" strokeDasharray="3 3" opacity="0.6" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="var(--ln)" strokeDasharray="3 3" opacity="0.6" />
              
              {/* Area under curve */}
              <path
                d="M 10 65 Q 60 55, 110 40 T 210 25 T 290 15 L 290 75 L 10 75 Z"
                fill="url(#chartGrad)"
              />
              {/* Line path */}
              <path
                d="M 10 65 Q 60 55, 110 40 T 210 25 T 290 15"
                fill="none"
                stroke="var(--ac)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Data points */}
              {[[10, 65], [60, 57], [110, 40], [160, 32], [210, 25], [250, 20], [290, 15]].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i === 6 ? 4 : 2.5}
                  fill={i === 6 ? 'var(--on)' : 'var(--ac)'}
                  stroke="var(--ac)"
                  strokeWidth={i === 6 ? 2 : 0}
                />
              ))}
            </svg>
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-mu">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span className="font-semibold text-tx">Week 4 (Current)</span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: "AREAS TO GROW" & "CURRENT STATS" */}
      <section className="rounded-2xl border border-ln bg-cd p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-ln pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Areas to grow</h2>
            <p className="text-xs text-mu">Target weak points, monitor condition & track lift PRs</p>
          </div>
          <span className="rounded-full bg-ac/10 px-2.5 py-1 text-xs font-semibold text-ac">
            Active Focus
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* LEFT SUB-CARD: Recent Condition Image & Measure Button */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-xl border border-ln bg-bg/60 p-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mu">Recent condition img</span>
                <span className="text-[10px] text-mu">Snapshot Oct 2026</span>
              </div>
              <div className="relative mt-2.5 h-44 w-full overflow-hidden rounded-lg border border-ln bg-black/5">
                <img
                  src="/condition_photo.png"
                  alt="Recent physique condition"
                  className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-xs">
                  {currentWeight} kg • {bodyFat}% BF
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMeasureModal(true)}
              className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ac py-2.5 text-xs font-semibold text-on transition-transform active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              measure
            </button>
          </div>

          {/* RIGHT SUB-CARD: Current Stats (deadlift, squats, endurance, etc) */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-xl border border-ln bg-bg/60 p-3.5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-mu uppercase tracking-wider">current stats</h3>
                <span className="text-[11px] text-mu">All-time Personal Records</span>
              </div>

              {/* Lifts & Endurance List */}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-ln bg-cd p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mu">Deadlift</span>
                    <span className="text-[10px] font-semibold text-ac bg-ac/10 px-1.5 py-0.5 rounded">PR</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">145 <span className="text-xs font-normal text-mu">kg</span></p>
                </div>

                <div className="rounded-lg border border-ln bg-cd p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mu">Squats</span>
                    <span className="text-[10px] font-semibold text-ac bg-ac/10 px-1.5 py-0.5 rounded">PR</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">125 <span className="text-xs font-normal text-mu">kg</span></p>
                </div>

                <div className="rounded-lg border border-ln bg-cd p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mu">Bench Press</span>
                    <span className="text-[10px] font-semibold text-ac bg-ac/10 px-1.5 py-0.5 rounded">PR</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">98 <span className="text-xs font-normal text-mu">kg</span></p>
                </div>

                <div className="rounded-lg border border-ln bg-cd p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mu">Endurance</span>
                    <span className="text-[10px] font-semibold text-ac bg-ac/10 px-1.5 py-0.5 rounded">5K</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">21m 45s</p>
                </div>
              </div>

              {/* Specific Areas to Grow (Muscles / Hypertrophy) */}
              <div className="mt-4 space-y-2.5">
                <span className="text-[11px] font-semibold text-mu">Priority Growth Focus</span>
                
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Hamstrings & Posterior Chain</span>
                    <span className="text-ac">72% target</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ln">
                    <div className="h-full bg-ac rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Upper Chest & Lateral Delts</span>
                    <span className="text-ac">85% target</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ln">
                    <div className="h-full bg-ac rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Shoulder Mobility & Core Stability</span>
                    <span className="text-ac">64% target</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ln">
                    <div className="h-full bg-ac rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION: REVIEW CURRENT PLAN & UPLOAD A NEW PLAN BUTTONS */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
        {/* REVIEW CURRENT PLAN BUTTON */}
        <button
          onClick={() => setShowReviewPlanModal(true)}
          className="group relative flex items-center justify-between rounded-2xl border border-ln bg-cd p-4 shadow-xs text-left transition-all hover:border-ac/50 hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ac/10 text-ac transition-colors group-hover:bg-ac group-hover:text-on">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold tracking-tight text-sm text-tx group-hover:text-ac transition-colors">
                review current plan
              </h3>
              <p className="text-xs text-mu">{defaultPlan.name} • {defaultPlan.sessions.length} sessions/wk</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-mu transition-transform group-hover:translate-x-1 group-hover:text-ac" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* UPLOAD A NEW PLAN BUTTON */}
        <button
          onClick={() => setShowUploadPlanModal(true)}
          className="group relative flex items-center justify-between rounded-2xl border border-ln bg-cd p-4 shadow-xs text-left transition-all hover:border-ac/50 hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ac/10 text-ac transition-colors group-hover:bg-ac group-hover:text-on">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold tracking-tight text-sm text-tx group-hover:text-ac transition-colors">
                upload a new plan
              </h3>
              <p className="text-xs text-mu">Import JSON or choose workout split preset</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-mu transition-transform group-hover:translate-x-1 group-hover:text-ac" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* MODAL 1: MEASURE BODY METRICS */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-ln bg-cd p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ln pb-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Body Measurements & Condition</h3>
                <p className="text-xs text-mu">Record latest stats to track your growth</p>
              </div>
              <button
                onClick={() => setShowMeasureModal(false)}
                className="rounded-full p-1 text-mu hover:bg-bg hover:text-tx"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetrics} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-mu">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ln bg-bg px-3 py-2 text-sm font-semibold outline-none focus:border-ac"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mu">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ln bg-bg px-3 py-2 text-sm font-semibold outline-none focus:border-ac"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-mu">Chest (cm)</label>
                  <input
                    type="number"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ln bg-bg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-ac"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mu">Waist (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ln bg-bg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-ac"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mu">Arms (cm)</label>
                  <input
                    type="number"
                    value={arms}
                    onChange={(e) => setArms(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ln bg-bg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-ac"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mu mb-1">Upload New Condition Photo</label>
                <div className="flex items-center justify-center rounded-lg border border-dashed border-ln bg-bg/50 p-4 text-center cursor-pointer hover:bg-bg transition-colors">
                  <div className="space-y-1">
                    <svg className="mx-auto h-6 w-6 text-mu" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs font-medium text-tx">Click to snap photo or select file</p>
                    <p className="text-[10px] text-mu">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeasureModal(false)}
                  className="flex-1 rounded-xl border border-ln py-2 text-xs font-semibold text-mu hover:text-tx"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-ac py-2 text-xs font-semibold text-on"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW CURRENT PLAN */}
      {showReviewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-ln bg-cd p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-ln pb-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Review Current Plan</h3>
                <p className="text-xs text-mu">{defaultPlan.name}</p>
              </div>
              <button
                onClick={() => setShowReviewPlanModal(false)}
                className="rounded-full p-1 text-mu hover:bg-bg hover:text-tx"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {defaultPlan.sessions.map((session, idx) => (
                <div key={idx} className="rounded-xl border border-ln bg-bg/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm tracking-tight text-ac">{session.name}</h4>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-mu">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][session.weekday]}
                    </span>
                  </div>
                  <div className="mt-2.5 divide-y divide-ln/50">
                    {session.items.map((item, iIndex) => (
                      <div key={iIndex} className="flex items-center justify-between py-1.5 text-xs">
                        <span className="font-medium text-tx capitalize">
                          {item.exerciseId.replace(/-/g, ' ')}
                        </span>
                        <span className="text-mu font-mono">
                          {item.sets} sets {item.targetReps ? `× ${item.targetReps} reps` : ''} {item.targetSeconds ? `× ${item.targetSeconds}s` : ''} {item.targetLoad ? `@ ${item.targetLoad}kg` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-ln pt-3 flex justify-end">
              <button
                onClick={() => setShowReviewPlanModal(false)}
                className="rounded-xl bg-ac px-5 py-2 text-xs font-semibold text-on"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD A NEW PLAN */}
      {showUploadPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-ln bg-cd p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ln pb-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Upload / Select New Plan</h3>
                <p className="text-xs text-mu">Import custom routine or select preset</p>
              </div>
              <button
                onClick={() => setShowUploadPlanModal(false)}
                className="rounded-full p-1 text-mu hover:bg-bg hover:text-tx"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <span className="text-xs font-semibold text-mu">Preset Training Routines</span>
              {PRESET_PLANS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPresetPlan(preset.name)}
                  className="group rounded-xl border border-ln bg-bg/50 p-3 hover:border-ac hover:bg-bg cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs group-hover:text-ac transition-colors">{preset.name}</h4>
                    <span className="rounded bg-ac/10 px-2 py-0.5 text-[10px] font-semibold text-ac">
                      {preset.sessionsCount} Days/Wk
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-mu">{preset.description}</p>
                </div>
              ))}

              <div className="pt-2 border-t border-ln">
                <span className="text-xs font-semibold text-mu block mb-2">Or Upload Custom Plan File (.json)</span>
                <label className="flex items-center justify-center rounded-xl border border-dashed border-ln bg-bg/40 p-3 text-center cursor-pointer hover:bg-bg transition-colors">
                  <div className="flex items-center gap-2 text-xs font-medium text-ac">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Browse & Upload Plan File</span>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectPresetPlan(`Uploaded: ${e.target.files[0].name}`);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 pt-2 flex justify-end">
              <button
                onClick={() => setShowUploadPlanModal(false)}
                className="rounded-xl border border-ln px-4 py-1.5 text-xs font-semibold text-mu"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      {metricSavedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-ac px-4 py-2 text-xs font-semibold text-on shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          ✓ Body measurements & photo updated successfully!
        </div>
      )}

      {uploadToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-ac px-4 py-2 text-xs font-semibold text-on shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          ✓ {uploadToast}
        </div>
      )}
    </div>
  );
}
