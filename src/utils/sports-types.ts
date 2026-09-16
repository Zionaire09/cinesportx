export interface Sport {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface Stream {
  id?: string;
  source?: string;
  streamNo?: number;
  embedUrl: string;
  name?: string;
  quality?: string;
  language?: string;
}

export interface APIMatch {
  id: string;
  title: string;
  date: string;
  category: string;
  league?: string;
  popular?: boolean;
  poster?: string;
  status?: 'live' | 'upcoming' | 'finished';
  teams?: {
    home: {
      name: string;
      badge: string;
    };
    away: {
      name: string;
      badge: string;
    };
  };
  sources: MatchSource[];
}

export type MatchState = 'live' | 'upcoming' | 'finished';

const LIVE_WINDOW_HOURS: Record<string, number> = {
  football: 3, soccer: 3, basketball: 3, tennis: 6, ufc: 6, mma: 6,
  boxing: 6, baseball: 5, cricket: 8, rugby: 3.5, hockey: 3,
  'ice hockey': 3, 'american football': 4, motorsport: 6, golf: 8,
  darts: 5, volleyball: 3,
};

export const getMatchState = (match: APIMatch, now = Date.now()): MatchState => {
  const date = new Date(match.date);
  const matchTime = date.getTime();
  const text = [match.title, match.category, match.league].filter(Boolean).join(' ').toLowerCase();
  const is24Seven = date.getFullYear() <= 1970 || (date.getMonth() === 0 && date.getDate() === 1);
  if (is24Seven || match.status === 'live') return 'live';
  if (match.status === 'finished' || /\bfinal\b/i.test(text)) return 'finished';
  if (match.status === 'upcoming' && matchTime > now) return 'upcoming';
  const sport = Object.keys(LIVE_WINDOW_HOURS).find((name) => text.includes(name));
  const windowMs = (LIVE_WINDOW_HOURS[sport || 'football'] || 3) * 60 * 60 * 1000;
  if (matchTime > now) return 'upcoming';
  return now - matchTime < windowMs ? 'live' : 'finished';
};
