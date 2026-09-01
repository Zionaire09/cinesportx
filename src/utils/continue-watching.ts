import { Media } from '@/utils/types';

export const CONTINUE_WATCHING_STORAGE_KEY = 'rabbitmeow:continue-watching:v1';
const MAX_CONTINUE_WATCHING_ITEMS = 30;

export interface ContinueWatchingItem extends Media {
  progressSeconds: number;
  durationSeconds: number;
  lastPlayedAt: number;
  serverKey: string;
  serverName?: string;
  season_number?: number;
  episode_number?: number;
  episode_title?: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const getContinueWatching = (): ContinueWatchingItem[] => {
  if (!isBrowser()) return [];
  try {
    const stored = window.localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is ContinueWatchingItem => Boolean(item && item.id && item.media_type))
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
  } catch (error) {
    console.warn('Unable to read Continue Watching history:', error);
    return [];
  }
};

export const saveContinueWatching = (item: ContinueWatchingItem) => {
  if (!isBrowser()) return;
  try {
    const existing = getContinueWatching();
    const isSameHistoryItem = (entry: ContinueWatchingItem) =>
      entry.id === item.id &&
      entry.media_type === item.media_type &&
      (item.media_type !== 'tv' ||
        (entry.season_number === item.season_number && entry.episode_number === item.episode_number));
    const next = [item, ...existing.filter((entry) => !isSameHistoryItem(entry))]
      .slice(0, MAX_CONTINUE_WATCHING_ITEMS);
    window.localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('continue-watching-updated'));
  } catch (error) {
    console.warn('Unable to save Continue Watching history:', error);
  }
};

export const removeContinueWatching = (id: number, mediaType: Media['media_type']) => {
  if (!isBrowser()) return;
  try {
    const next = getContinueWatching().filter((item) => !(item.id === id && item.media_type === mediaType));
    window.localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('continue-watching-updated'));
  } catch (error) {
    console.warn('Unable to remove Continue Watching item:', error);
  }
};

export const getContinueWatchingRoute = (item: ContinueWatchingItem) => {
  if (item.media_type === 'tv') {
    const season = item.season_number || 1;
    const episode = item.episode_number || 1;
    return `/player/tv/${item.id}/${season}/${episode}`;
  }
  return `/player/movie/${item.id}`;
};

export const removeContinueWatchingItem = (target: ContinueWatchingItem) => {
  if (!isBrowser()) return;
  try {
    const next = getContinueWatching().filter((item) => !(
      item.id === target.id &&
      item.media_type === target.media_type &&
      (target.media_type !== 'tv' ||
        (item.season_number === target.season_number && item.episode_number === target.episode_number))
    ));
    window.localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('continue-watching-updated'));
  } catch (error) {
    console.warn('Unable to remove Continue Watching item:', error);
  }
};
