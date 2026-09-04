import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAiringTodayTV, getNowPlayingMovies } from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import Ads from '@/components/Ads';
import PageTransition from '@/components/PageTransition';
import { matchesMediaFilters, mediaGenres, mediaTypes, MediaFilterType } from '@/config/mediaFilters';
import { Film, Loader2, Sparkles, Tv } from 'lucide-react';

const New = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<MediaFilterType>('all');
  const [genre, setGenre] = useState('all');
  const [media, setMedia] = useState<Media[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const newQuery = useQuery({
    queryKey: ['new-releases', page],
    queryFn: async () => {
      const [movies, shows] = await Promise.all([getNowPlayingMovies(page), getAiringTodayTV(page)]);
      return [...movies, ...shows];
    },
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    if (!newQuery.data) return;
    setMedia((previous) => {
      const existing = new Set(previous.map((item) => `${item.media_type}-${item.id}`));
      return [...previous, ...newQuery.data.filter((item) => !existing.has(`${item.media_type}-${item.id}`))];
    });
  }, [newQuery.data]);
  const hasMore = Boolean(newQuery.data?.length);
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !newQuery.isFetching) setPage((current) => current + 1);
    }, { rootMargin: '800px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, newQuery.isFetching]);
  const filtered = useMemo(() => media.filter((item) => matchesMediaFilters(item, type, genre)), [media, type, genre]);
  const handleFilterChange = (nextType: MediaFilterType, nextGenre: string) => { setType(nextType); setGenre(nextGenre); };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <main className="pb-16 pt-20">
          <div className="container px-4 pt-6 md:pt-8">
            <div className="mb-8 flex items-center gap-3"><div className="rounded-2xl border border-accent/25 bg-accent/10 p-3"><Sparkles className="h-6 w-6 text-accent" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Fresh arrivals</p><h1 className="text-3xl font-bold tracking-tight md:text-4xl">New</h1><p className="mt-1 text-sm text-white/60">Recently released movies and newly airing shows</p></div></div>
            <FilterControls type={type} genre={genre} onChange={handleFilterChange} />
          </div>
          {newQuery.isLoading && !media.length ? <MediaGridSkeleton /> : newQuery.isError ? <div className="py-16 text-center text-white/70">Unable to load new titles. Please try again.</div> : filtered.length ? <MediaGrid media={filtered} title="New Releases" /> : <div className="py-16 text-center text-white/60">No matching titles loaded yet. Keep scrolling to search more releases.</div>}
          <div ref={loadMoreRef} className="flex min-h-20 items-center justify-center text-sm text-white/45">{newQuery.isFetching && media.length ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading more</> : hasMore ? 'Scroll for more' : 'You have reached the end'}</div>
        </main>
        <Footer /><Ads />
      </div>
    </PageTransition>
  );
};

export const FilterControls = ({ type, genre, onChange }: { type: MediaFilterType; genre: string; onChange: (type: MediaFilterType, genre: string) => void }) => (
  <div className="mb-8 space-y-5">
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-lg shadow-black/10">
      <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45"><Film className="h-3.5 w-3.5 text-accent" />Browse by type</div>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/25 p-1">{mediaTypes.map((item) => <button key={item.value} onClick={() => onChange(item.value, genre)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${type === item.value ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>{item.label}</button>)}</div>
    </div>
    <div><div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45"><Tv className="h-3.5 w-3.5 text-accent" />Browse by category</div><div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" role="group" aria-label="Filter by category">{mediaGenres.map((item) => <button key={item.id} onClick={() => onChange(type, item.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${genre === item.id ? 'border-accent/70 bg-accent/15 text-white shadow-sm shadow-accent/10' : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-accent/50 hover:bg-accent/10 hover:text-white'}`}>{item.label}</button>)}</div></div>
  </div>
);
export default New;
