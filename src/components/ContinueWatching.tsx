import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Server, Tv, X } from 'lucide-react';
import { backdropSizes, posterSizes } from '@/utils/api';
import {
  ContinueWatchingItem,
  getContinueWatching,
  getContinueWatchingRoute,
  removeContinueWatchingItem,
  removeContinueWatchingSeries,
} from '@/utils/continue-watching';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Ready to resume';
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m in` : `${minutes}m in`;
};

const ContinueWatching = () => {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const refresh = useCallback(() => setItems(getContinueWatching()), []);

  useEffect(() => {
    refresh();
    window.addEventListener('continue-watching-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('continue-watching-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const groupedItems = useMemo(() => {
    const grouped = new Map<string, ContinueWatchingItem>();
    items.forEach((item) => {
      const key = `${item.media_type}-${item.id}`;
      if (!grouped.has(key)) grouped.set(key, item);
    });
    return Array.from(grouped.values());
  }, [items]);

  if (groupedItems.length === 0) return null;

  const handleDelete = (item: ContinueWatchingItem) => {
    if (item.media_type === 'tv') {
      removeContinueWatchingSeries(item.id);
    } else {
      removeContinueWatchingItem(item);
    }
  };

  return (
    <section className="mb-10 px-4 md:px-8" aria-labelledby="continue-watching-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-accent">Pick up where you left off</p>
          <h2 id="continue-watching-heading" className="text-xl font-bold text-white md:text-2xl">Continue Watching</h2>
        </div>
        <span className="text-xs font-semibold text-white/50">{groupedItems.length} {groupedItems.length === 1 ? 'title' : 'titles'}</span>
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {groupedItems.map((item) => {
          const title = item.title || item.name || 'Untitled';
          const imagePath = item.backdrop_path || item.poster_path;
          const image = imagePath
            ? `${item.backdrop_path ? backdropSizes.medium : posterSizes.medium}${imagePath}`
            : '/placeholder-image.jpg';
          const progress = item.durationSeconds > 0
            ? Math.min(100, Math.max(0, (item.progressSeconds / item.durationSeconds) * 100))
            : 0;
          return (
            <div key={`${item.media_type}-${item.id}`} className="group relative w-[300px] flex-shrink-0 snap-start sm:w-[360px]">
              <Link to={getContinueWatchingRoute(item)} className="relative block aspect-video overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-xl transition-transform duration-200 hover:-translate-y-1 hover:border-accent/70">
                <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-white/75">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1"><Play className="h-3 w-3 fill-current text-accent" /> {formatTime(item.progressSeconds)}</span>
                    {item.media_type === 'tv' && <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1"><Tv className="h-3 w-3 text-accent" /> TV show</span>}
                  </div>
                  <h3 className="line-clamp-1 text-base font-bold text-white">{title}</h3>
                  {item.media_type === 'tv' && item.season_number && item.episode_number && (
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-accent">S{item.season_number} · E{item.episode_number}{item.episode_title ? ` · ${item.episode_title}` : ''}</p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/65"><Server className="h-3 w-3" /> {item.serverName || item.serverKey || 'Default server'}</div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div>
                </div>
              </Link>
              <button type="button" onClick={() => handleDelete(item)} aria-label={`Remove ${title} from Continue Watching`} className="absolute right-2 top-2 z-10 rounded-full bg-black/75 p-1.5 text-white/85 shadow-md transition-colors hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatching;
