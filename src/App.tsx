import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import New from "./pages/New";
import Trending from "./pages/Trending";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import Player from "./pages/Player";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DMCANotice from "./pages/DMCANotice";
import TakedownNotice from "./pages/TakedownNotice";
import ContentRemoval from "./pages/ContentRemoval";
import Sports from "./pages/Sports";
import SportMatchPlayer from "./pages/SportMatchPlayer";
import PersonFilmography from "./pages/PersonFilmography";
import ChristmasGreeting from "./components/ChristmasGreeting";

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

const useCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    const origin = window.location.origin || window.location.protocol + '//' + window.location.host;
    canonicalTag.setAttribute('href', `${origin}${location.pathname}`);
  }, [location]);
};

const AnimatedRoutes = () => {
  const location = useLocation();
  usePageTracking();
  useCanonical();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/movie" element={<Movies />} />
        <Route path="/movies" element={<Navigate to="/movie" replace />} />
        <Route path="/tv" element={<TVShows />} />
        <Route path="/new" element={<New />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/player/:matchId" element={<SportMatchPlayer />} />
        <Route path="/movie/1368337" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/969681" element={<Navigate to="/takedown" replace />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TVDetails />} />
        <Route path="/person/:id" element={<PersonFilmography />} />
        <Route path="/player/movie/1368337" element={<Navigate to="/takedown" replace />} />
        <Route path="/player/movie/969681" element={<Navigate to="/takedown" replace />} />
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
