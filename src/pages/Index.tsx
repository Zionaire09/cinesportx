import { useState, useEffect } from 'react';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getUpcomingMovies,
  getActionMovies,
  getComedySeries
} from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ContentRow from '@/components/ContentRow';
import AdBanners from '@/components/AdBanners';
import Footer from '@/components/Footer';
import Spinner from '@/components/ui/spinner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Chatbot from '@/components/Chatbot';
import Ads from '@/components/Ads';
import { Helmet } from 'react-helmet';
import WelcomeDialog from '@/components/WelcomeDialog';
import ContinueWatching from '@/components/ContinueWatching';

const Index = () => {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<Media[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Media[]>([]);
  const [actionMovies, setActionMovies] = useState<Media[]>([]);
  const [comedySeries, setComedySeries] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const [showWelcomeCard, setShowWelcomeCard] = useState(() => {
    return localStorage.getItem('hideWelcomeCard') !== 'true';
  });

  const [showWelcomeDialog, setShowWelcomeDialog] = useState(() => {
    return localStorage.getItem('hideWelcomeDialog') !== 'true';
  });

  const closeWelcomeDialog = () => {
    localStorage.setItem('hideWelcomeDialog', 'true');
    setShowWelcomeDialog(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const trendingPromise = (async () => {
        const firstPages = await Promise.all([
          getTrending('day', 1),
          getTrending('day', 2),
        ]);
        const seen = new Set<string>();
        const merged = firstPages.flat().filter((item) => {
          const key = `${item.media_type}-${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const withBackdrop = () => merged.filter((item) => item.backdrop_path);
        if (withBackdrop().length < 20) {
          const nextPage = await getTrending('day', 3);
          nextPage.forEach((item) => {
            const key = `${item.media_type}-${item.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          });
        }
        return merged;
      })();
      const secondaryPromise = Promise.allSettled([
        getPopularMovies(),
        getPopularTVShows(),
        getTopRatedMovies(),
        getTopRatedTVShows(),
        getUpcomingMovies(),
        getActionMovies(),
        getComedySeries(),
      ]);

      // The Home banner only needs Trending data. Release it without waiting for every content row.
      const trendingResult = await Promise.allSettled([trendingPromise]);
      const trendingData = trendingResult[0].status === 'fulfilled' ? trendingResult[0].value : [];
      setTrendingMedia(trendingData.filter(item => item.backdrop_path).slice(0, 20));
      setIsLoading(false);
      setTimeout(() => setContentVisible(true), 300);

      const results = await secondaryPromise;
      const data = results.map(result => result.status === 'fulfilled' ? result.value : []);
      const [
        popularMoviesData,
        popularTVData,
        topMoviesData,
        topTVData,
        upcomingMoviesData,
        actionMoviesData,
        comedySeriesData,
      ] = data;

      setPopularMovies(popularMoviesData);
      setPopularTVShows(popularTVData);
      setTopRatedMovies(topMoviesData);
      setTopRatedTVShows(topTVData);
      setUpcomingMovies(upcomingMoviesData);
      setActionMovies(actionMoviesData);
      setComedySeries(comedySeriesData);
    };

    fetchData().catch(error => {
      console.error('Error fetching homepage data:', error);
      setIsLoading(false);
      setContentVisible(true);
    });
  }, []);

  const closeWelcomeCard = () => {
    localStorage.setItem('hideWelcomeCard', 'true');
    setShowWelcomeCard(false);
  };

  return (
    <>
      <WelcomeDialog isOpen={showWelcomeDialog} onClose={closeWelcomeDialog} />

      <main className="min-h-screen bg-background pb-16">
        <Navbar />
        <PWAInstallPrompt />

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" className="text-accent" />
          </div>
        ) : (
          <>
             <div className="pt-24">
                 {trendingMedia.length > 0 && (
                   <Hero
                     media={trendingMedia.slice(0, 5)}
                     className="hero"
                   />
                 )}
            </div>

            <div
              className={`mt-8 md:mt-12 transition-opacity duration-500 ${
                contentVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ContinueWatching />
              <ContentRow title="Trending Now" media={trendingMedia} />
              <div className="px-4 md:px-8"><AdBanners /></div>
              <ContentRow title="Popular Movies" media={popularMovies} />
              <ContentRow title="Popular TV Shows" media={popularTVShows} />
              <ContentRow title="Top Rated Movies" media={topRatedMovies} />
              <ContentRow title="Top Rated TV Shows" media={topRatedTVShows} />
              <ContentRow title="Upcoming Movies" media={upcomingMovies} />
              <ContentRow title="Action Movies" media={actionMovies} />
              <ContentRow title="Comedy Series" media={comedySeries} />
            </div>
          </>
        )}

        <Footer />

        <Ads />
      </main>
    </>
  );
};

export default Index;
