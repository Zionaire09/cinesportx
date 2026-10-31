import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import ChristmasGreeting from "./components/ChristmasGreeting";

const Index = lazy(() => import("./pages/Index"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const New = lazy(() => import("./pages/New"));
const Trending = lazy(() => import("./pages/Trending"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TVDetails = lazy(() => import("./pages/TVDetails"));
const Player = lazy(() => import("./pages/Player"));
const Search = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DMCANotice = lazy(() => import("./pages/DMCANotice"));
const TakedownNotice = lazy(() => import("./pages/TakedownNotice"));
const ContentRemoval = lazy(() => import("./pages/ContentRemoval"));
const Sports = lazy(() => import("./pages/Sports"));
const SportMatchPlayer = lazy(() => import("./pages/SportMatchPlayer"));
const PersonFilmography = lazy(() => import("./pages/PersonFilmography"));
const LiveTV = lazy(() => import("./pages/LiveTV"));
const LiveTVPlayer = lazy(() => import("./pages/LiveTVPlayer"));
const Replays = lazy(() => import("./pages/Replays").then((module) => ({ default: module.Replays })));
const ReplayPlayer = lazy(() => import("./pages/Replays").then((module) => ({ default: module.ReplayPlayer })));

const queryClient = new QueryClient();
const GA_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);
};

const SITE_ORIGIN = 'https://msportsx.xyz';

const useCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    const rawPath = location.pathname || '/';
    const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_ORIGIN}${normalizedPath}`;
    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;
    const noindex = /^\/(search|player(?:\/|$)|sports\/player(?:\/|$)|live-tv\/player(?:\/|$)|replay(?:\/|$))/.test(normalizedPath);
    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.name = 'robots';
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = noindex ? 'noindex, follow' : 'index, follow';
    const titles: Record<string, string> = {
      '/': 'MSportsX – Watch Sports, Movies & TV Shows Online',
      '/movie': 'Movies Online – MSportsX',
      '/tv': 'TV Shows Online – MSportsX',
      '/new': 'New Releases – MSportsX',
      '/trending': 'Trending Movies & TV Shows – MSportsX',
      '/sports': 'Live Sports Streams – MSportsX',
      '/replays': 'Sports Replays – MSportsX',
      '/live-tv': 'Live TV Channels – MSportsX',
      '/live-tv/player': 'Live TV Player – MSportsX',
    };
    document.title = titles[normalizedPath] || document.title;
  }, [location.pathname]);
};

const AnimatedRoutes = () => {
  const location = useLocation();
  usePageTracking();
  useCanonical();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center bg-background" role="status" aria-label="Loading page"><div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground" /></div>}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/movie" element={<Movies />} />
        <Route path="/movies" element={<Navigate to="/movie" replace />} />
        <Route path="/tv" element={<TVShows />} />
        <Route path="/new" element={<New />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/replays" element={<Replays />} />
        <Route path="/replay/:id" element={<ReplayPlayer />} />
        <Route path="/live-tv" element={<LiveTV />} />
        <Route path="/live-tv/player" element={<LiveTVPlayer />} />
        <Route path="/sports/player/admin-willow-cricket" element={<Navigate to="/takedown" replace />} />
        <Route path="/sports/player/*" element={<SportMatchPlayer />} />
        <Route path="/movie/1368337" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/969681" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/936075" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1339713" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1291595" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1423191" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1400837" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1255833" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1560520" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1248832" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1302904" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1236045" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/1007757" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TVDetails />} />
        <Route path="/person/:id" element={<PersonFilmography />} />
        <Route path="/player/movie/1368337" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/969681" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/936075" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1339713" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1291595" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1423191" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1400837" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1255833" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1560520" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1248832" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1302904" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1236045" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/1007757" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/:id" element={<Player />} />
        <Route path="/player/tv/:id/:season/:episode" element={<Player />} />
        <Route path="/search" element={<Search />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/dmca" element={<DMCANotice />} />
        <Route path="/takedown" element={<TakedownNotice />} />
        <Route path="/content-removal" element={<ContentRemoval />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <ChristmasGreeting />
        <AnimatedRoutes />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
