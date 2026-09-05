import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPopularMovies, getTopRatedMovies } from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Film, ChevronDown, Grid3X3, List } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Ads from '@/components/Ads';
import { CategoryFilter, CountryFilter } from './New';



const MOVIES_PAGE_STATE_KEY = 'moviesPageState';

type MoviesPageState = {
  activeTab?: 'popular' | 'top_rated';
  viewMode?: 'grid' | 'list';
  genreFilter?: string;
  countryFilter?: string;
  popularPage?: number;
  topRatedPage?: number;
  allPopularMovies?: Media[];
  allTopRatedMovies?: Media[];
};

const readMoviesPageState = (): MoviesPageState => {
  try {
    const stored = sessionStorage.getItem(MOVIES_PAGE_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const Movies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>(() => readMoviesPageState().activeTab ?? 'popular');
  const [popularPage, setPopularPage] = useState(() => readMoviesPageState().popularPage ?? 1);
  const [topRatedPage, setTopRatedPage] = useState(() => readMoviesPageState().topRatedPage ?? 1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => readMoviesPageState().viewMode ?? 'grid');
  const [allPopularMovies, setAllPopularMovies] = useState<Media[]>(() => readMoviesPageState().allPopularMovies ?? []);
  const [allTopRatedMovies, setAllTopRatedMovies] = useState<Media[]>(() => readMoviesPageState().allTopRatedMovies ?? []);
  const [countryFilter, setCountryFilter] = useState<string>(() => readMoviesPageState().countryFilter ?? 'all');
  const [genreFilter, setGenreFilter] = useState<string>(() => readMoviesPageState().genreFilter ?? 'all');

  useEffect(() => {
    sessionStorage.setItem(MOVIES_PAGE_STATE_KEY, JSON.stringify({ activeTab, viewMode, genreFilter, countryFilter, popularPage, topRatedPage, allPopularMovies, allTopRatedMovies }));
  }, [activeTab, viewMode, genreFilter, countryFilter, popularPage, topRatedPage, allPopularMovies, allTopRatedMovies]);


  const popularMoviesQuery = useQuery({
    queryKey: ['popularMovies', popularPage, genreFilter, countryFilter],
    queryFn: () => getPopularMovies(popularPage, 'popularity.desc', genreFilter, countryFilter),
  });

  const topRatedMoviesQuery = useQuery({
    queryKey: ['topRatedMovies', topRatedPage, genreFilter, countryFilter],
    queryFn: () => getTopRatedMovies(topRatedPage, 'vote_average.desc', genreFilter, countryFilter),
  });
    const resetFilteredLists = () => {
    setPopularPage(1);
    setTopRatedPage(1);
    setAllPopularMovies([]);
    setAllTopRatedMovies([]);
  };

  const handleCountryChange = (value: string) => {
    setCountryFilter(value);
    resetFilteredLists();
  };

  const handleGenreChange = (value: string) => {
    setGenreFilter(value);
    resetFilteredLists();
  };

  const handleAdBannerClick = () =>{
    window.open('https://a.acebet.com/api/click?a=64&lp=1&c=61', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (popularMoviesQuery.data) {
      setAllPopularMovies(prev => {
        const newMovies = popularMoviesQuery.data
          .filter(movie => !prev.some(p => p.id === (movie.id || movie.media_id || movie.tmdb_id)))
          .map(movie => ({
            ...movie,
            id: movie.id || movie.media_id || movie.tmdb_id,
            media_id: movie.id || movie.media_id || movie.tmdb_id,
            media_type: 'movie',
            __page: popularPage,
          }));
        return [...prev, ...newMovies].sort((a, b) => ((a as Media & { __page?: number }).__page ?? 0) - ((b as Media & { __page?: number }).__page ?? 0));
      });
    }
  }, [popularMoviesQuery.data]);

  useEffect(() => {
    if (topRatedMoviesQuery.data) {
      setAllTopRatedMovies(prev => {
        const newMovies = topRatedMoviesQuery.data
          .filter(movie => !prev.some(p => p.id === (movie.id || movie.media_id || movie.tmdb_id)))
          .map(movie => ({
            ...movie,
            id: movie.id || movie.media_id || movie.tmdb_id,
            media_id: movie.id || movie.media_id || movie.tmdb_id,
            media_type: 'movie',
            __page: topRatedPage,
          }));
        return [...prev, ...newMovies].sort((a, b) => ((a as Media & { __page?: number }).__page ?? 0) - ((b as Media & { __page?: number }).__page ?? 0));
      });
    }
  }, [topRatedMoviesQuery.data]);

  useEffect(() => {
    if (popularMoviesQuery.data?.length > 0) {
      queryClient.prefetchQuery({
        queryKey: ['popularMovies', popularPage + 1, genreFilter, countryFilter],
        queryFn: () => getPopularMovies(popularPage + 1, 'popularity.desc', genreFilter, countryFilter),
      });
    }
  }, [popularPage, queryClient, popularMoviesQuery.data, genreFilter, countryFilter]);

  useEffect(() => {
    if (topRatedMoviesQuery.data?.length > 0) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedMovies', topRatedPage + 1, genreFilter, countryFilter],
        queryFn: () => getTopRatedMovies(topRatedPage + 1, 'vote_average.desc', genreFilter, countryFilter),
      });
    }
  }, [topRatedPage, queryClient, topRatedMoviesQuery.data, genreFilter, countryFilter]);

  const handleShowMorePopular = () => {
    if (!popularMoviesQuery.isFetching && hasMorePopular) {
      setPopularPage(prev => prev + 1);
    }
  };

  const handleShowMoreTopRated = () => {
    if (!topRatedMoviesQuery.isFetching && hasMoreTopRated) {
      setTopRatedPage(prev => prev + 1);
    }
  };

  const hasMorePopular = popularMoviesQuery.data?.length > 0;
  const hasMoreTopRated = topRatedMoviesQuery.data?.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700;
      if (!nearBottom) return;

      if (activeTab === 'popular' && hasMorePopular && !popularMoviesQuery.isFetching) {
        setPopularPage(prev => prev + 1);
      } else if (activeTab === 'top_rated' && hasMoreTopRated && !topRatedMoviesQuery.isFetching) {
        setTopRatedPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, hasMorePopular, hasMoreTopRated, popularMoviesQuery.isFetching, topRatedMoviesQuery.isFetching]);

  const filterMoviesByGenre = (movies: Media[]) => {
    if (genreFilter === 'all') return movies;
    return movies.filter((movie) => movie.genre_ids?.includes(parseInt(genreFilter)));
  };

  const filteredPopularMovies = filterMoviesByGenre(allPopularMovies);
  const filteredTopRatedMovies = filterMoviesByGenre(allTopRatedMovies);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4"> </h1>
            </div>
            <div className="flex items-center gap-4">
              <CountryFilter value={countryFilter} onChange={handleCountryChange} />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="border-white/10 text-white hover:bg-accent/20"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <CategoryFilter type="movie" genre={genreFilter} onChange={handleGenreChange} showTypeLabel={false} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
                <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
              {popularMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : popularMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
              ) : (
                <>
                   
                   <MediaGrid
                    media={filteredPopularMovies}
                    title="Popular Movies"
                    listView={viewMode === 'list'}
                  />
                  {hasMorePopular && (
                    <div className="flex justify-center my-8">
                      <Button
                        onClick={handleShowMorePopular}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {popularMoviesQuery.isFetching ? (
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

            <TabsContent value="top_rated" className="focus-visible:outline-none animate-fade-in">
              {topRatedMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : topRatedMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
              ) : (
                <>
                  <MediaGrid
                    media={filteredTopRatedMovies}
                    title="Top Rated Movies"
                    listView={viewMode === 'list'}
                  />
                  {hasMoreTopRated && (
                    <div className="flex justify-center my-8">
                      <Button
                        onClick={handleShowMoreTopRated}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {topRatedMoviesQuery.isFetching ? (
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
        </main>

        <Footer />
        <Ads /> {/* Conditionally render Ads */}
      </div>
    </PageTransition>
  );
};

export default Movies;
 