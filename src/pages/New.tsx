import { useEffect, useMemo, useState } from 'react';
import { Film, Sparkles, Tv } from 'lucide-react';
import { getAiringTodayTV, getNowPlayingMovies } from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import Ads from '@/components/Ads';
import PageTransition from '@/components/PageTransition';
import { matchesMediaFilters, mediaGenres, mediaTypes, MediaFilterType } from '@/config/mediaFilters';

const New = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [type, setType] = useState<MediaFilterType>('all');
  const [genre, setGenre] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getNowPlayingMovies(), getAiringTodayTV()])
      .then(([movies, shows]) => setMedia([...movies, ...shows]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => media.filter((item) => matchesMediaFilters(item, type, genre)), [media, type, genre]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <main className="pb-16 pt-20">
          <div className="container px-4 pt-6 md:pt-8">
            <div className="mb-8 flex items-center gap-3"><Sparkles className="h-8 w-8 text-accent" /><div><h1 className="text-3xl font-bold">New</h1><p className="mt-1 text-sm text-white/60">Recently released movies and newly airing shows</p></div></div>
            <FilterControls type={type} genre={genre} onTypeChange={setType} onGenreChange={setGenre} />
          </div>
          {isLoading ? <MediaGridSkeleton /> : filtered.length ? <MediaGrid media={filtered} title="New Releases" /> : <div className="py-16 text-center text-white/60">No new titles match these filters.</div>}
        </main>
        <Footer /><Ads />
      </div>
    </PageTransition>
  );
};

export const FilterControls = ({ type, genre, onTypeChange, onGenreChange }: { type: MediaFilterType; genre: string; onTypeChange: (value: MediaFilterType) => void; onGenreChange: (value: string) => void }) => (
  <div className="mb-8 space-y-4">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
      {mediaTypes.map((item) => <button key={item.value} onClick={() => onTypeChange(item.value)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${type === item.value ? 'border-accent bg-accent text-accent-foreground' : 'border-white/15 bg-white/5 text-white/70 hover:border-accent/60 hover:text-white'}`}>{item.label}</button>)}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" role="group" aria-label="Filter by category">
      {mediaGenres.map((item) => <button key={item.id} onClick={() => onGenreChange(item.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${genre === item.id ? 'border-accent bg-accent/20 text-white' : 'border-white/15 bg-white/5 text-white/65 hover:border-accent/60 hover:text-white'}`}>{item.label}</button>)}
    </div>
  </div>
);

export default New;
