import { create } from 'zustand';

export type Screen = 'home' | 'workout' | 'plan' | 'reels' | 'progress' | 'me';
export type StyleName = 'paper' | 'midnight' | 'sage';

const KEY = 'fit.style';
const loadStyle = (): StyleName => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'paper' || v === 'midnight' || v === 'sage') return v;
  } catch { /* storage unavailable */ }
  return 'paper';
};

interface UI {
  screen: Screen;
  style: StyleName;
  go: (s: Screen) => void;
  setStyle: (s: StyleName) => void;
}

export const useUI = create<UI>((set) => ({
  screen: 'home',
  style: loadStyle(),
  go: (screen) => set({ screen }),
  setStyle: (style) => {
    try { localStorage.setItem(KEY, style); } catch { /* ignore */ }
    set({ style });
  },
}));
