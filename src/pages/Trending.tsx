import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getTrending } from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown } from 'lucide-react';
import Ads from '@/components/Ads';


const Trending = () => {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [allTrending, setAllTrending] = useState<Media[]>([]);
  
  const trendingQuery = useQuery({
    queryKey: ['trending', timeWindow, page],
    queryFn: () => getTrending(timeWindow, page),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (trendingQuery.data) {
      setAllTrending(prev => {
        const newItems = trendingQuery.data
          .filter(item => !prev.some(p => `${p.media_type}-${p.id}` === `${item.media_type}-${item.id || item.media_id || item.tmdb_id}`))
          .map(item => {
            const transformedItem = {
              ...item,
              id: item.id || item.media_id || item.tmdb_id,
              media_id: item.id || item.media_id || item.tmdb_id,
              media_type: item.media_type,
              __page: page,
            };
            return transformedItem;
          });
        return [...prev, ...newItems].sort((a, b) => ((a as Media & { __page?: number }).__page ?? 0) - ((b as Media & { __page?: number }).__page ?? 0));
      });
    }
  }, [trendingQuery.data]);

  useEffect(() => {
    if (trendingQuery.data?.length > 0) {
      queryClient.prefetchQuery({
        queryKey: ['trending', timeWindow, page + 1],
        queryFn: () => getTrending(timeWindow, page + 1),
      });
    }
  }, [page, timeWindow, queryClient, trendingQuery.data]);
  
  const hasMore = trendingQuery.data?.length > 0;

  const handleShowMore = () => {
    if (!trendingQuery.isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700;
      if (!nearBottom) return;
      if (!trendingQuery.isFetching && hasMore) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, trendingQuery.isFetching, page, timeWindow]);

  const handleTimeWindowChange = (value: 'day' | 'week') => {
    setTimeWindow(value);
    setPage(1);
    setAllTrending([]);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-3 mb-8 pt-10">
            <TrendingUp className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-white">Trending</h1>
            <Tabs value={timeWindow} onValueChange={handleTimeWindowChange} className="ml-auto">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger value="day" className="data-[state=active]:bg-accent/20">Today</TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-accent/20">This Week</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={timeWindow} className="w-full">
            <TabsContent value="day">
              {trendingQuery.isLoading && !allTrending.length ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">
                  Error loading trending content. Please try again. Details: {trendingQuery.error instanceof Error ? trendingQuery.error.message : 'Unknown error'}
                </div>
              ) : (
                <>
                  <MediaGrid media={allTrending} title="Trending Today" />
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
             
            
            <TabsContent value="week">
              {trendingQuery.isLoading && !allTrending.length ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">
                  Error loading trending content. Please try again. Details: {trendingQuery.error instanceof Error ? trendingQuery.error.message : 'Unknown error'}
                </div>
              ) : (
                <>
                  <MediaGrid media={allTrending} title="Trending This Week" />
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <Ads /> {/* Updated to conditional rendering */}
    </div>
  );
};

export default Trending;
