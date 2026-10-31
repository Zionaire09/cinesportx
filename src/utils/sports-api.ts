import { APIMatch, MatchSource, Sport, Stream, StreamType } from './sports-types';

type CatalogStream = {
  id?: number | string;
  name?: string;
  tag?: string;
  poster?: string;
  uri_name?: string;
  starts_at?: number;
  ends_at?: number;
  start_timestamp?: number;
  end_timestamp?: number;
  always_live?: number | boolean;
  category_name?: string;
  iframe?: string;
  m3u8?: string;
  playlist_full?: string;
  player_type?: string;
  source_type?: string;
  uri?: string;
  sources?: RawSource[];
  vip_source?: string;
};

type CatalogGroup = {
  id?: number | string;
  category?: string;
  always_live?: number | boolean;
  streams?: CatalogStream[];
};

type CatalogResponse = {
  success?: boolean;
  streams?: CatalogGroup[];
  data?: { streams?: CatalogGroup[] };
  error?: string;
};

type RawSource = {
  name?: string;
  default?: boolean;
  type?: string;
  data?: string;
  url?: string;
  file?: string;
};

type DetailStream = CatalogStream & {
  category?: number | string;
  description?: string;
  end_timestamp?: number;
  start_timestamp?: number;
  vip_mpegts?: string;
  vip_stream?: boolean;
};

type DetailResponse = {
  success?: boolean;
  data?: DetailStream;
  error?: string;
};

const API_DOMAINS = ['ppv.st', 'ppv.tj', 'ppvs.pk', 'ppv.rw', 'ppv.ms', 'ppv.bi'] as const;
export const SPORTS_API_SERVERS = API_DOMAINS.map((domain, index) => ({
  number: index + 1,
  label: `Server ${index + 1}`,
  host: `api.${domain}`,
  base: `https://api.${domain}/api`,
}));
const API_BASES = SPORTS_API_SERVERS.map((server) => server.base);
const API_TIMEOUT_MS = 7000;
const CATALOG_CACHE_MS = 30_000;
const API_PREFERRED_BASE_KEY = 'rabbitmeow-preferred-sports-api-base';

export const SPORTS_CATEGORIES: Sport[] = [
  { id: 'american-football', name: 'American Football' },
  { id: 'australian-football', name: 'Australian Football' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'cricket', name: 'Cricket' },
  { id: 'football', name: 'Football' },
  { id: 'rugby', name: 'Rugby' },
  { id: '247-streams', name: '24/7 Streams' },
];

const catalogCache = new Map<number, { expiresAt: number; matches: APIMatch[] }>();

const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

const getPreferredApiBase = () => {
  try {
    return window.sessionStorage.getItem(API_PREFERRED_BASE_KEY);
  } catch {
    return null;
  }
};

const rememberApiBase = (base: string) => {
  try {
    window.sessionStorage.setItem(API_PREFERRED_BASE_KEY, base);
  } catch {
    // Storage can be unavailable in private browsing; the request still succeeded.
  }
};

const apiGet = async <T>(path: string, serverNumber?: number): Promise<T> => {
  let lastError: unknown;
  const preferredBase = getPreferredApiBase();
  const selectedBase = serverNumber === undefined ? undefined : API_BASES[serverNumber - 1];
  if (serverNumber !== undefined && !selectedBase) {
    throw new Error(`Unknown sports API server: ${serverNumber}`);
  }
  const bases = selectedBase
    ? [selectedBase]
    : preferredBase && API_BASES.includes(preferredBase as (typeof API_BASES)[number])
      ? [preferredBase, ...API_BASES.filter((base) => base !== preferredBase)]
      : API_BASES;

  for (const base of bases) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(joinUrl(base, path), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-FS-Client': 'Rabbitmeow PPV WebClient 01054bb',
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = (await response.json()) as T & { success?: boolean; error?: string };
      if (payload.success === false) throw new Error(payload.error || 'Sports API returned an error');
      if (serverNumber === undefined) rememberApiBase(base);
      return payload;
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All sports API mirrors are unavailable');
};

export const encodeStreamPath = (uri: string) => uri.split('/').map((segment) => encodeURIComponent(segment)).join('/');
export const encodeSportsPath = encodeStreamPath;

const toNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const cleanCategory = (category?: string) => (category || 'Sports event').replace(/^VIP \| /, '').trim();

const categoryId = (category: string) => {
  const normalized = cleanCategory(category).toLowerCase();
  return normalized === '24/7 streams' ? '247-streams' : normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

const toDate = (startsAt?: number, alwaysLive = false) => {
  if (alwaysLive || startsAt == null || startsAt <= 0) return new Date(0).toISOString();
  return new Date(startsAt * 1000).toISOString();
};

const normalizeMatch = (stream: CatalogStream, group: CatalogGroup): APIMatch | null => {
  const uriName = typeof stream.uri_name === 'string' && stream.uri_name ? stream.uri_name : undefined;
  const title = typeof stream.name === 'string' && stream.name ? stream.name : undefined;
  if (!uriName || !title) return null;

  const category = cleanCategory(stream.category_name || group.category);
  const startsAt = toNumber(stream.starts_at ?? stream.start_timestamp);
  const endsAt = toNumber(stream.ends_at ?? stream.end_timestamp);
  const alwaysLive = Boolean(stream.always_live || group.always_live || category === '24/7 Streams');

  return {
    id: uriName,
    catalogId: stream.id,
    sportId: categoryId(category),
    uriName,
    title,
    date: toDate(startsAt, alwaysLive),
    category,
    league: stream.tag || undefined,
    poster: stream.poster || undefined,
    startsAt,
    endsAt,
    alwaysLive,
    tag: stream.tag || undefined,
    sources: [],
  };
};

const loadCatalog = async (force = false, serverNumber?: number) => {
  const cacheKey = serverNumber ?? 0;
  const cached = catalogCache.get(cacheKey);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.matches;

  const response = await apiGet<CatalogResponse>('/streams', serverNumber);
  const groups = response.streams || response.data?.streams || [];
  const matches = groups.flatMap((group) => (group.streams || [])
    .map((stream) => normalizeMatch(stream, group))
    .filter((match): match is APIMatch => Boolean(match)));

  catalogCache.set(cacheKey, { expiresAt: Date.now() + CATALOG_CACHE_MS, matches });
  return matches;
};

const sortMatches = (matches: APIMatch[]) => [...matches].sort((a, b) => {
  const aStart = a.startsAt ?? Number.MAX_SAFE_INTEGER;
  const bStart = b.startsAt ?? Number.MAX_SAFE_INTEGER;
  return aStart - bStart;
});

export const getSportsList = async (): Promise<Sport[]> => SPORTS_CATEGORIES;
export const getAllMatches = async (): Promise<APIMatch[]> => loadCatalog();

export const getMatchesBySport = async (sportId: string): Promise<APIMatch[]> => {
  const matches = await loadCatalog();
  if (sportId === '247-streams') return matches.filter((match) => match.alwaysLive);
  return matches.filter((match) => match.sportId === sportId || categoryId(match.category) === sportId);
};

export const getPopularMatchesBySport = async (sportId: string): Promise<APIMatch[]> => sortMatches(await getMatchesBySport(sportId));
export const getAllPopularMatches = async (): Promise<APIMatch[]> => sortMatches(await loadCatalog());
export const getTodayMatches = async (): Promise<APIMatch[]> => loadCatalog();
export const getLiveMatches = async (): Promise<APIMatch[]> => {
  const matches = await loadCatalog();
  return matches.filter((match) => match.alwaysLive || (match.startsAt != null && match.endsAt != null && match.startsAt * 1000 <= Date.now() && match.endsAt * 1000 > Date.now()));
};

const sourceValue = (source?: RawSource) => source?.data || source?.url || source?.file || '';
const isHttpUrl = (value?: string) => Boolean(value && /^https?:\/\//i.test(value.trim()));

const resolveDetailSources = (detail: DetailStream): Array<{ value: string; type: StreamType; name: string; index: number }> => {
  const sources = [...(detail.sources || [])]
    .map((source, index) => ({ source, index }))
    .sort((a, b) => Number(Boolean(b.source.default)) - Number(Boolean(a.source.default)));
  const resolved = sources
    .map(({ source, index }) => {
      const value = sourceValue(source).trim();
      if (!isHttpUrl(value)) return null;
      const sourceType = (source.type || '').toLowerCase();
      const type: StreamType = sourceType.includes('iframe') || sourceType.includes('embed') ? 'iframe' : 'video';
      return { value, type, name: source.name || (type === 'iframe' ? 'External Player Frame' : 'Direct stream'), index };
    })
    .filter((source): source is { value: string; type: StreamType; name: string; index: number } => Boolean(source));

  if (resolved.length) return resolved;

  const legacyCandidates: Array<{ value?: string; type: StreamType; name: string }> = [
    { value: detail.iframe, type: 'iframe', name: 'External Player Frame' },
    { value: detail.m3u8, type: 'video', name: 'HLS stream' },
    { value: detail.playlist_full, type: 'video', name: 'Playlist stream' },
    { value: detail.vip_source, type: 'video', name: 'Backup stream' },
    { value: detail.vip_mpegts, type: 'video', name: 'Backup stream' },
  ];
  return legacyCandidates
    .map((candidate, index) => candidate.value && isHttpUrl(candidate.value) ? { value: candidate.value, type: candidate.type, name: candidate.name, index } : null)
    .filter((source): source is { value: string; type: StreamType; name: string; index: number } => Boolean(source));
};

const loadDetail = async (match: APIMatch, serverNumber?: number): Promise<DetailStream> => {
  const response = await apiGet<DetailResponse>(`/streams/${encodeStreamPath(match.uriName || match.id)}`, serverNumber);
  if (!response.data) throw new Error(response.error || 'This sports stream is unavailable');
  return response.data;
};

export const getStreamsForMatch = async (match: APIMatch, serverNumber?: number): Promise<{
  activeSources: Array<{ source: string; sourceId: string; streamCount: number }>;
  groupedStreams: Record<string, Stream[]>;
}> => {
  const detail = await loadDetail(match, serverNumber);
  const resolvedSources = resolveDetailSources(detail);
  const groupedStreams: Record<string, Stream[]> = {};

  resolvedSources.forEach((source, index) => {
    const sourceName = source.name || `Player ${index + 1}`;
    const stream: Stream = {
      id: `${match.id}-${index + 1}`,
      source: sourceName,
      streamNo: index + 1,
      embedUrl: source.value,
      streamType: source.type,
      name: sourceName,
      quality: source.type === 'video' ? 'Direct' : 'Embed',
    };
    groupedStreams[sourceName] = [stream];
  });

  const activeSources = Object.entries(groupedStreams).map(([source, streams]) => ({
    source,
    sourceId: match.id,
    streamCount: streams.length,
  }));
  return { activeSources, groupedStreams };
};

export const getMatchById = async (matchId: string, serverNumber?: number): Promise<APIMatch | null> => {
  const decodedId = (() => {
    try {
      return decodeURIComponent(matchId);
    } catch {
      return matchId;
    }
  })();
  const matches = await loadCatalog(false, serverNumber);
  const match = matches.find((candidate) => candidate.id === decodedId || String(candidate.catalogId) === decodedId);
  if (match) return match;

  try {
    const response = await apiGet<DetailResponse>(`/streams/${encodeStreamPath(decodedId)}`, serverNumber);
    const detail = response.data;
    if (!detail?.uri && !detail?.name) return null;
    const startsAt = toNumber(detail.start_timestamp);
    return {
      id: detail.uri || decodedId,
      catalogId: detail.id,
      sportId: categoryId(String(detail.category || 'Sports event')),
      uriName: detail.uri || decodedId,
      title: detail.name || 'Sports match',
      date: toDate(startsAt),
      category: String(detail.category || 'Sports event'),
      league: detail.tag || undefined,
      poster: detail.poster || undefined,
      startsAt,
      endsAt: toNumber(detail.end_timestamp),
      tag: detail.tag || undefined,
      sources: [],
    };
  } catch {
    return null;
  }
};

export const getActiveSourcesForMatch = async (matchId: string) => {
  const match = await getMatchById(matchId);
  if (!match) return [];
  return (await getStreamsForMatch(match)).activeSources;
};

export const getStreamsGroupedBySource = async (matchId: string) => {
  const match = await getMatchById(matchId);
  return match ? (await getStreamsForMatch(match)).groupedStreams : {};
};

export const getAllActiveStreams = async (matchId: string) => {
  const match = await getMatchById(matchId);
  if (!match) return [];
  const grouped = (await getStreamsForMatch(match)).groupedStreams;
  return Object.values(grouped).flat();
};

export const getSourceIdForSource = async (matchId: string, sourceName: string) => {
  const match = await getMatchById(matchId);
  if (!match) return null;
  const streams = await getStreamsForMatch(match);
  return streams.activeSources.some((source) => source.source === sourceName) ? match.id : null;
};

export const getTeamBadgeUrl = () => '/placeholder.svg';

export const getMatchPosterUrl = (posterId?: string) => posterId && isHttpUrl(posterId) ? posterId : '/no-match-photo.png';
