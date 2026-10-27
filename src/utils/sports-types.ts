export interface Sport {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface MatchSource {
  source: string;
  id: string;
  streamCount?: number;
}

export type StreamType = 'iframe' | 'video';

export interface Stream {
  id?: string;
  source?: string;
  streamNo?: number;
  embedUrl: string;
  streamType?: StreamType;
  name?: string;
  quality?: string;
  language?: string;
  hd?: boolean;
}

export interface APIMatch {
  id: string;
  catalogId?: number | string;
  sportId?: string;
  uriName?: string;
  title: string;
  date: string;
  category: string;
  league?: string;
  popular?: boolean;
  poster?: string;
  status?: 'live' | 'upcoming' | 'finished';
  startsAt?: number;
  endsAt?: number;
  alwaysLive?: boolean;
  tag?: string;
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

const LIVE_WINDOW_SECONDS: Record<string, number> = {
  football: 3 * 60 * 60,
  soccer: 3 * 60 * 60,
  basketball: 3 * 60 * 60,
  tennis: 6 * 60 * 60,
  ufc: 6 * 60 * 60,
  mma: 6 * 60 * 60,
  boxing: 6 * 60 * 60,
  baseball: 5 * 60 * 60,
  cricket: 8 * 60 * 60,
  rugby: 3.5 * 60 * 60,
  hockey: 3 * 60 * 60,
  'ice hockey': 3 * 60 * 60,
  'american football': 4 * 60 * 60,
  motorsport: 6 * 60 * 60,
  golf: 8 * 60 * 60,
  darts: 5 * 60 * 60,
  volleyball: 3 * 60 * 60,
  wrestling: 3 * 60 * 60,
};

export const getMatchState = (match: APIMatch, now = Date.now()): MatchState => {
  if (match.alwaysLive) return 'live';

  const date = new Date(match.date);
  const matchTime = match.startsAt != null ? match.startsAt * 1000 : date.getTime();
  const endTime = match.endsAt != null ? match.endsAt * 1000 : undefined;
  const text = [match.title, match.category, match.league, match.tag].filter(Boolean).join(' ').toLowerCase();
  const explicitStatus = match.status;

  if (explicitStatus === 'finished') return 'finished';
  if (explicitStatus === 'live') return 'live';
  if (explicitStatus === 'upcoming' && matchTime > now) return 'upcoming';
  if (matchTime > now) return 'upcoming';
  if (endTime != null) return endTime > now ? 'live' : 'finished';

  const sport = Object.keys(LIVE_WINDOW_SECONDS).find((name) => text.includes(name));
  const liveWindow = (LIVE_WINDOW_SECONDS[sport || 'football'] || 3 * 60 * 60) * 1000;
  return now - matchTime < liveWindow ? 'live' : 'finished';
};
