import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Server, X } from 'lucide-react';
import { posterSizes } from '@/utils/api';
import { ContinueWatchingItem, getContinueWatching, getContinueWatchingRoute, removeContinueWatching } from '@/utils/continue-watching';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Just started';
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

  const handleDelete = (item: ContinueWatchingItem) => {
    removeContinueWatching(item.id, item.media_type);
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-10 px-4 md:px-8" aria-labelledby="continue-watching-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-accent">Pick up where you left off</p>
          <h2 id="continue-watching-heading" className="text-xl font-bold text-white md:text-2xl">Continue Watching</h2>
        </div>
        <span className="text-xs font-semibold text-white/50">Saved on this device</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => {
          const title = item.title || item.name || 'Untitled';
          const poster = item.poster_path ? `${posterSizes.medium}${item.poster_path}` : '/placeholder-image.jpg';
          const progress = item.durationSeconds > 0
            ? Math.min(100, Math.max(0, (item.progressSeconds / item.durationSeconds) * 100))
            : 0;
          return (
            <div key={`${item.media_type}-${item.id}`} className="group relative min-w-0">
              <Link to={getContinueWatchingRoute(item)} className="block overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:border-accent/60">
                <div className="relative aspect-[2/3] overflow-hidden bg-black/30">
                  <img src={poster} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/75">
                      <Play className="h-3 w-3 fill-current text-accent" /> {formatTime(item.progressSeconds)}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-bold text-white">{title}</h3>
                    {item.media_type === 'tv' && item.season_number && item.episode_number && (
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-accent">S{item.season_number} · E{item.episode_number}{item.episode_title ? ` · ${item.episode_title}` : ''}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/60">
                      <Server className="h-3 w-3" /> {item.serverName || item.serverKey || 'Default server'}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              </Link>
              <button type="button" onClick={() => handleDelete(item)} aria-label={`Remove ${title} from Continue Watching`} className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1.5 text-white/80 opacity-100 shadow-md transition-colors hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatching;
