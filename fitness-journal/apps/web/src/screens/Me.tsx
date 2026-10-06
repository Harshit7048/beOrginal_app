import { useUI, type StyleName } from '../store';

const STYLES: { id: StyleName; label: string }[] = [
  { id: 'paper', label: 'Paper' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'sage', label: 'Sage' },
];

export default function Me() {
  const { style, setStyle } = useUI();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Me</h1>
      <p className="mt-6 text-sm text-mu">Style</p>
      <div className="mt-2 flex gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              style === s.id ? 'border-ac bg-ac text-on' : 'border-ln text-tx'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-8 text-sm text-mu">Body and goals, exercise library, and import will live here.</p>
    </div>
  );
}
