import { useEffect, useState } from 'react';
import {
  getNewKoreanEpisodes,
  getNewKoreanMovies,
  getTrendingKoreanMovies,
  getKoreanDramas,
} from '@/utils/api';
import { Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import Footer from '@/components/Footer';
import Ads from '@/components/Ads';
import Spinner from '@/components/ui/spinner';
import PageTransition from '@/components/PageTransition';

const Kdrama = () => {
  const [trendingDramas, setTrendingDramas] = useState<Media[]>([]);
  const [newEpisodes, setNewEpisodes] = useState<Media[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [newMovies, setNewMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchKoreanContent = async () => {
      const results = await Promise.allSettled([
        getKoreanDramas(),
        getNewKoreanEpisodes(),
        getTrendingKoreanMovies(),
        getNewKoreanMovies(),
      ]);

      if (!isMounted) return;

      const [dramas, episodes, movies, recentMovies] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : []
      );

      setTrendingDramas(dramas);
      setNewEpisodes(episodes);
      setTrendingMovies(movies);
      setNewMovies(recentMovies);
      setIsLoading(false);
      window.setTimeout(() => isMounted && setContentVisible(true), 100);
    };

    fetchKoreanContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-white">
        <Navbar />

        <main className="pb-16 pt-20">
          <div className="container px-4 pb-4 pt-6 md:pt-8">
            <div className="mb-8 max-w-3xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
                Korean collection
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Kdrama
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/65 md:text-base">
                Explore popular Korean TV dramas, recently aired Korean series, trending Korean movies, and new Korean film releases.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <Spinner size="lg" className="text-accent" />
            </div>
          ) : (
            <div
              className={`transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              <ContentRow title="Trending Korean Drama" media={trendingDramas} />
              <ContentRow title="Newly Released Episodes" media={newEpisodes} />
              <ContentRow title="Trending Korean Movies" media={trendingMovies} />
              <ContentRow title="New Korean Movies" media={newMovies} />

              {trendingDramas.length === 0 &&
                newEpisodes.length === 0 &&
                trendingMovies.length === 0 &&
                newMovies.length === 0 && (
                  <div className="container px-4 py-16 text-center text-white/65">
                    Korean content is currently unavailable. Please try again later.
                  </div>
                )}
            </div>
          )}
        </main>

        <Footer />
        <Ads />
      </div>
    </PageTransition>
  );
};

export default Kdrama;
