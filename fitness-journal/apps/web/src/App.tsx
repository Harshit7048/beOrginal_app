import { useEffect } from 'react';
import { useUI, type Screen } from './store';
import Home, { HomeBackdrop } from './screens/Home';
import Workout from './screens/Workout';
import Me from './screens/Me';
import Placeholder from './screens/Placeholder';
 

const TABS: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Today' },
  { id: 'plan', label: 'Plan' },
  { id: 'reels', label: 'Reels' },
  { id: 'progress', label: 'Progress' },
  { id: 'me', label: 'Me' },
];

export default function App() {
  const { screen, style, go } = useUI();
  useEffect(() => { document.documentElement.dataset.style = style; }, [style]);

  const activeTab = screen === 'workout' ? 'home' : screen;

  const home = screen === 'home';

  return (
    
    <div className={`relative mx-auto flex h-full max-w-md flex-col overflow-hidden ${home ? 'bg-black text-white' : 'bg-bg text-tx'}`}>
      <HomeBackdrop/>
      {home && <HomeBackdrop />}
      <main className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {screen === 'home' && <Home />}
        {screen === 'workout' && <Workout />}
        {screen === 'me' && <Me />}
        {screen === 'plan' && <Placeholder title="Weekly plan" note="Plan builder comes in phase 1." />}
        {screen === 'reels' && <Placeholder title="Saved reels" note="Import and search come in phase 3." />}
        {screen === 'progress' && <Placeholder title="Progress" note="Recent bests and the dot calendar come in phase 2." />}
      </main>
      <nav
        className={`relative z-10 flex justify-around border-t py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
          home ? 'border-white/10 bg-black/40 backdrop-blur-md' : 'border-ln bg-bg'
        }`}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={`px-3 py-1 text-xs ${
              activeTab === t.id
                ? home ? 'font-semibold text-white' : 'font-semibold text-tx'
                : home ? 'text-white/50' : 'text-mu'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
