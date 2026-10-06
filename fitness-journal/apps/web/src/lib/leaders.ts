export type LeaderQuote = {
  name: string;
  quote: string;
  photo: string;
};

/** Public-domain portraits (Wikimedia Commons). Rotates by calendar day. */
export const LEADERS: LeaderQuote[] = [
  
  {
    name: 'Seneca',
    quote: 'We suffer more often in imagination than in reality.',
    photo: '/leaders/seneca.jpg',
  },
  {
    name: 'Epictetus',
    quote: 'First say to yourself what you would be; and then do what you have to do.',
    photo: '/leaders/epictetus.jpg',
  },
  {
    name: 'Napoleon Bonaparte',
    quote: 'Victory belongs to the most persevering.',
    photo: '/leaders/napoleon.jpg',
  },
  {
    name: 'Abraham Lincoln',
    quote: 'I am a slow walker, but I never walk back.',
    photo: '/leaders/lincoln.jpg',
  },
  {
    name: 'Sun Tzu',
    quote: 'Victorious warriors win first and then go to war.',
    photo: '/leaders/suntzu.jpg',
  },
  {
    name: 'Marcus Aurelius',
    quote: 'The impediment to action advances action. What stands in the way becomes the way.',
    photo: '/leaders/marcus.jpg',
  },
  {
    name: 'Theodore Roosevelt',
    quote: 'Do what you can, with what you have, where you are.',
    photo: '/leaders/roosevelt.jpg',
  },
  
];

export function leaderForDate(d = new Date()): LeaderQuote {
  const start = Date.UTC(d.getFullYear(), 0, 1);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = Math.floor((now - start) / 86_400_000);
  return LEADERS[day % LEADERS.length];
}
