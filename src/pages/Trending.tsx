import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getTrending } from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown } from 'lucide-react';
import Ads from '@/components/Ads';
import { FilterControls } from './New';
import { matchesMediaFilters, MediaFilterType } from '@/config/mediaFilters';

const Trending = () => {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [page, setPage] = useState(1);
  const [type, setType] = useState<MediaFilterType>('all');
  const [genre, setGenre] = useState('all');
  const [allTrending, setAllTrending] = useState<Media[]>([]);
  const queryClient = useQueryClient();
  const trendingQuery = useQuery({ queryKey: ['trending', timeWindow, page], queryFn: () => getTrending(timeWindow, page), placeholderData: keepPreviousData });

  useEffect(() => {
    if (!trendingQuery.data) return;
    setAllTrending((previous) => {
      const additions = trendingQuery.data.filter((item) => !previous.some((existing) => `${existing.media_type}-${existing.id}` === `${item.media_type}-${item.id}`));
      return [...previous, ...additions];
    });
  }, [trendingQuery.data]);

  useEffect(() => {
    if (trendingQuery.data?.length) queryClient.prefetchQuery({ queryKey: ['trending', timeWindow, page + 1], queryFn: () => getTrending(timeWindow, page + 1) });
  }, [page, timeWindow, queryClient, trendingQuery.data]);

  const hasMore = Boolean(trendingQuery.data?.length);
  const filteredTrending = useMemo(() => allTrending.filter((item) => matchesMediaFilters(item, type, genre)), [allTrending, type, genre]);
  const handleShowMore = () => { if (!trendingQuery.isFetching && hasMore) setPage((current) => current + 1); };
  const handleTimeWindowChange = (value: 'day' | 'week') => { if (value === timeWindow) return; setTimeWindow(value); setPage(1); setAllTrending([]); };

  useEffect(() => {
    const handleScroll = () => { if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700 && !trendingQuery.isFetching && hasMore) setPage((current) => current + 1); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, trendingQuery.isFetching]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1"><div className="container px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6 pt-10"><TrendingUp className="h-8 w-8 text-accent" /><h1 className="text-3xl font-bold text-white">Trending</h1><Tabs value={timeWindow} onValueChange={(value) => handleTimeWindowChange(value as 'day' | 'week')} className="ml-auto"><TabsList className="bg-transparent border-none"><TabsTrigger value="day" className="data-[state=active]:bg-accent/20">Today</TabsTrigger><TabsTrigger value="week" className="data-[state=active]:bg-accent/20">This Week</TabsTrigger></TabsList></Tabs></div>
        <FilterControls type={type} genre={genre} onChange={(nextType, nextGenre) => { setType(nextType); setGenre(nextGenre); }} />
        {trendingQuery.isLoading && !allTrending.length ? <MediaGridSkeleton /> : trendingQuery.isError ? <div className="py-12 text-center text-white">Error loading trending content. Please try again.</div> : <><MediaGrid media={filteredTrending} title={timeWindow === 'day' ? 'Trending Today' : 'Trending This Week'} />{hasMore && <div className="flex justify-center my-8"><Button onClick={handleShowMore} variant="outline" className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white">{trendingQuery.isFetching ? 'Loading...' : <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>}</Button></div>}</>}
      </div></main>
      <Footer /><Ads />
    </div>
  );
};
export default Trending;
