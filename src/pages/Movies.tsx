import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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



const MOVIES_PAGE_STATE_KEY = 'moviesPageState';

type MoviesPageState = {
  activeTab?: 'popular' | 'top_rated';
  viewMode?: 'grid' | 'list';
  sortBy?: 'default' | 'title' | 'release_date' | 'rating';
  genreFilter?: string;
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
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>(() => readMoviesPageState().sortBy ?? 'default');
  const [genreFilter, setGenreFilter] = useState<string>(() => readMoviesPageState().genreFilter ?? 'all');

  useEffect(() => {
    sessionStorage.setItem(MOVIES_PAGE_STATE_KEY, JSON.stringify({ activeTab, viewMode, sortBy, genreFilter, popularPage, topRatedPage, allPopularMovies, allTopRatedMovies }));
  }, [activeTab, viewMode, sortBy, genreFilter]);

  const popularMoviesQuery = useQuery({
    queryKey: ['popularMovies', popularPage],
    queryFn: () => getPopularMovies(popularPage),
    placeholderData: keepPreviousData,
  });

  const topRatedMoviesQuery = useQuery({
    queryKey: ['topRatedMovies', topRatedPage],
    queryFn: () => getTopRatedMovies(topRatedPage),
    placeholderData: keepPreviousData,
  });
    const handleAdBannerClick = () => {
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
        queryKey: ['popularMovies', popularPage + 1],
        queryFn: () => getPopularMovies(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularMoviesQuery.data]);

  useEffect(() => {
    if (topRatedMoviesQuery.data?.length > 0) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedMovies', topRatedPage + 1],
        queryFn: () => getTopRatedMovies(topRatedPage + 1),
      });
    }
  }, [topRatedPage, queryClient, topRatedMoviesQuery.data]);

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

  const sortMoviesWithinPages = (movies: Media[]) => {
    const filteredMovies = movies.filter(movie =>
      genreFilter === 'all' || movie.genre_ids?.includes(parseInt(genreFilter))
    );

    // Keep the server page as the primary order so filtered pages remain append-only.
    return filteredMovies.sort((a, b) => {
      const pageA = (a as Media & { __page?: number }).__page ?? 0;
      const pageB = (b as Media & { __page?: number }).__page ?? 0;
      if (pageA !== pageB) return pageA - pageB;

      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'release_date':
          return (b.release_date || '').localeCompare(a.release_date || '');
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        default:
          return 0;
      }
    });
  };

  const filteredPopularMovies = sortMoviesWithinPages(allPopularMovies);
  const filteredTopRatedMovies = sortMoviesWithinPages(allTopRatedMovies);

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
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by Genre" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="28">Action</SelectItem>
                  <SelectItem value="12">Adventure</SelectItem>
                  <SelectItem value="16">Animation</SelectItem>
                  <SelectItem value="35">Comedy</SelectItem>
                  <SelectItem value="80">Crime</SelectItem>
                  <SelectItem value="99">Documentary</SelectItem>
                  <SelectItem value="18">Drama</SelectItem>
                  <SelectItem value="10751">Family</SelectItem>
                  <SelectItem value="14">Fantasy</SelectItem>
                  <SelectItem value="36">History</SelectItem>
                  <SelectItem value="27">Horror</SelectItem>
                  <SelectItem value="10402">Music</SelectItem>
                  <SelectItem value="9648">Mystery</SelectItem>
                  <SelectItem value="10749">Romance</SelectItem>
                  <SelectItem value="878">Science Fiction</SelectItem>
                  <SelectItem value="10770">TV Movie</SelectItem>
                  <SelectItem value="53">Thriller</SelectItem>
                  <SelectItem value="10752">War</SelectItem>
                  <SelectItem value="37">Western</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
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
 