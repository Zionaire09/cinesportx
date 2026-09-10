import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SportsMatchGrid from '@/components/SportsMatchGrid';
import PageTransition from '@/components/PageTransition';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sport } from '@/utils/sports-types';
import {
  getSportsList,
  getAllPopularMatches,
  getLiveMatches,
  getTodayMatches,
  getMatchesBySport,
} from '@/utils/sports-api';
import { getColorForSport } from '@/utils/sports-colors';
import { useToast } from '@/hooks/use-toast';
import Ads from '@/components/Ads';
import { Search, Radio, Sparkles, CalendarDays, Activity, Zap, Flame, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Sports = () => {
  const [activeTab, setActiveTab] = useState<string>('popular');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const accentColor = 'hsl(var(--accent))';



  const {
    data: sportsList = [],
    isLoading: sportsLoading,
    error: sportsError
  } = useQuery({
    queryKey: ['sports-list'],
    queryFn: getSportsList
  });

  const { data: popularMatches = [], isLoading: popularLoading } = useQuery({
    queryKey: ['sports-popular-matches'],
    queryFn: getAllPopularMatches
  });

  const { data: liveMatches = [], isLoading: liveLoading } = useQuery({
    queryKey: ['sports-live-matches'],
    queryFn: getLiveMatches
  });

  const { data: todayMatches = [], isLoading: todayLoading } = useQuery({
    queryKey: ['sports-today-matches'],
    queryFn: getTodayMatches
  });

  const {
    data: sportMatches = [],
    isLoading: sportMatchesLoading
  } = useQuery({
    queryKey: ['sports-matches', selectedSport, activeTab],
    queryFn: async () => {
      if (selectedSport === 'all') return [];
      
      if (activeTab === 'popular') {
        const { getPopularMatchesBySport } = await import('@/utils/sports-api');
        return getPopularMatchesBySport(selectedSport);
      } else if (activeTab === 'live') {
        const allMatches = await getMatchesBySport(selectedSport);
        return allMatches.filter(match => match.status === 'live');
      } else {
        return getMatchesBySport(selectedSport);
      }
    },
    enabled: selectedSport !== 'all'
  });

  useEffect(() => {
    if (sportsError) {
      toast({
        title: "Error",
        description: "Failed to load sports. Please try again later.",
        variant: "destructive"
      });
    }
  }, [sportsError, toast]);

  const handleTabChange = (value: string) => setActiveTab(value);
  const handleSportChange = (sportId: string) => setSelectedSport(sportId);

  const filterMatches = (matches: any[]) => {
    if (!searchQuery) return matches;
    const query = searchQuery.toLowerCase();
    return matches.filter(match => 
      match.title?.toLowerCase().includes(query) ||
      match.teams?.home?.name?.toLowerCase().includes(query) ||
      match.teams?.away?.name?.toLowerCase().includes(query) ||
      match.league?.toLowerCase().includes(query)
    );
  };

  const getCurrentMatches = () => {
    if (selectedSport === 'all') {
      switch (activeTab) {
        case 'popular': return popularMatches;
        case 'live': return liveMatches;
        case 'all': return todayMatches;
        default: return [];
      }
    } else {
      return sportMatches;
    }
  };

  const getIsLoading = () => {
    if (selectedSport === 'all') {
      switch (activeTab) {
        case 'popular': return popularLoading;
        case 'live': return liveLoading;
        case 'all': return todayLoading;
        default: return false;
      }
    } else {
      return sportMatchesLoading;
    }
  };

  const getEmptyMessage = () => {
    if (selectedSport === 'all') {
      switch (activeTab) {
        case 'popular': return "No popular matches available at the moment. Use a VPN as your ISP might have blocked the stream servers.";
        case 'live': return "No live matches streaming right now. Use a VPN as your ISP might have blocked the stream servers.";
        case 'all': return "No matches scheduled for today. Use a VPN as your ISP might have blocked the stream servers.";
        default: return "No matches available. Use a VPN as your ISP might have blocked the stream servers.";
      }
    } else {
      const sportName = sportsList.find(s => s.id === selectedSport)?.name || '';
      switch (activeTab) {
        case 'popular': return `No popular ${sportName} matches available.`;
        case 'live': return `No live ${sportName} matches right now.`;
        default: return `No ${sportName} matches available.`;
      }
    }
  };

  const liveCount = liveMatches.length;
  const selectedColor = getColorForSport(selectedSport);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-100 font-sans antialiased selection:bg-neutral-800">
        <Navbar />
        <div className="pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            
            {/* Immersive Dashboard Header with Vibrant Gradient */}
            <motion.div 
              className="mb-6 relative overflow-hidden rounded-2xl md:mb-12 md:rounded-3xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Animated Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedColor.bg} opacity-90`} />
              
              {/* Animated Overlay Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
              
              {/* Animated Background Icon */}
              <motion.div 
                className="absolute top-0 right-0 p-4 opacity-10 md:p-8 md:opacity-15"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-20 w-20 text-white md:h-40 md:w-40" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10 px-4 py-4 md:px-8 md:py-8">
                <motion.h1 
                  className="text-3xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  RABBITMEOW <span className="text-white drop-shadow-xl">SPORTS CENTER</span>
                </motion.h1>
                <motion.p 
                  className="text-white/90 text-xs md:text-base font-bold tracking-wide mt-2 md:mt-3 drop-shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Select an arena profile below to tap into global live streams.
                  {liveCount > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-white font-black">
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-white md:w-2 md:h-2"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      {liveCount} LIVE NOW
                    </span>
                  )}
                </motion.p>
              </div>
            </motion.div>

            <motion.a
              href="https://rmppv.xyz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the preferred stable live stream link at rmppv.xyz"
              className="group mb-6 flex items-center justify-between gap-2 rounded-xl border border-red-400/80 bg-gradient-to-r from-red-600/55 via-rose-500/35 to-red-950/20 px-3 py-3 text-left shadow-[0_0_24px_rgba(239,68,68,0.25)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:from-red-500/70 hover:shadow-[0_0_48px_rgba(239,68,68,0.48)] md:mb-8 md:gap-4 md:rounded-2xl md:border-2 md:px-5 md:py-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-950/50 ring-2 ring-red-300/20 md:h-11 md:w-11 md:ring-4">
                  <Zap className="h-4 w-4 md:h-5 md:w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-100">
                    <span className="rounded-full bg-red-950/50 px-2.5 py-1 text-red-50">Recommended</span>
                    <span className="text-red-200">Stable live stream</span>
                  </span>
                  <span className="mt-1 block text-xs font-bold text-white sm:text-sm md:text-lg">For the best viewing experience, use</span>
                  <span className="mt-0.5 block truncate text-lg font-black tracking-tight text-red-100 underline decoration-red-200/70 decoration-2 underline-offset-4 transition-colors group-hover:text-white sm:text-2xl md:text-3xl">rmppv.xyz</span>
                </span>
              </span>
              <ExternalLink className="h-6 w-6 shrink-0 text-red-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
            <motion.a
              href="https://rmppv.xyz/replays"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open sports replays at rmppv.xyz/replays"
              className="group mb-6 flex items-center justify-between gap-3 rounded-xl border-2 border-cyan-300/70 bg-gradient-to-r from-blue-700/70 via-cyan-600/45 to-blue-950/40 px-4 py-4 text-left shadow-[0_0_28px_rgba(34,211,238,0.25)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-100 hover:shadow-[0_0_42px_rgba(34,211,238,0.45)] md:mb-8 md:gap-4 md:rounded-2xl md:px-5 md:py-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-blue-950 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-100/30 md:h-11 md:w-11 md:ring-4">
                  <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 md:text-xs">Missed the match?</span>
                  <span className="block truncate text-lg font-black tracking-tight text-white md:text-2xl">Watch Sports Replays</span>
                  <span className="block truncate text-xs font-bold text-cyan-100/80 md:text-sm">rmppv.xyz/replays</span>
                </span>
              </span>
              <ExternalLink className="h-5 w-5 shrink-0 text-cyan-100 md:h-6 md:w-6" />
            </motion.a>

            {/* Premium Category Strips with Colorful Buttons */}
            <motion.div 
              className="mb-8 border-b border-white/10 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex gap-3 min-w-max px-1">
                <motion.button
                  onClick={() => handleSportChange('all')}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase transition-all duration-300 border relative md:border-2 overflow-hidden group shadow-md md:shadow-lg hover:shadow-2xl`}
                  style={{
                    background: selectedSport === 'all' ? `linear-gradient(135deg, rgb(59, 130, 246), rgb(34, 211, 238))` : 'rgba(255,255,255,0.1)',
                    borderColor: selectedSport === 'all' ? 'rgb(147, 197, 253)' : 'rgba(255,255,255,0.2)',
                    color: selectedSport === 'all' ? 'white' : 'rgba(255,255,255,0.7)',
                    boxShadow: selectedSport === 'all' ? '0 0 30px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ALL DISCIPLINES
                </motion.button>

                {sportsLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div 
                        key={i} 
                        className="w-32 h-11 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    ))}
                  </div>
                ) : (
                  sportsList.map((sport: Sport, index) => {
                    const sportColor = getColorForSport(sport.id);
                    const isSelected = selectedSport === sport.id;
                    
                    return (
                      <motion.button
                        key={sport.id}
                        onClick={() => handleSportChange(sport.id)}
                        className={`px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase transition-all duration-300 border md:border-2 relative overflow-hidden group shadow-md md:shadow-lg hover:shadow-2xl text-white`}
                        style={{
                          background: sportColor.gradient,
                          borderColor: isSelected ? 'rgba(255,255,255,0.9)' : sportColor.glow,
                          boxShadow: isSelected ? `0 0 30px ${sportColor.glow}` : `0 0 12px ${sportColor.glow}`
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        {sport.name}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* High-Contrast Integrated Action Deck */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
              <motion.div 
                className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-white/10 to-white/5 p-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <TabsList className="grid grid-cols-3 bg-white/10 p-0.5 md:p-1 rounded-lg md:rounded-xl w-full md:w-[420px] h-9 md:h-12 border border-white/20 backdrop-blur-sm">
                  <TabsTrigger value="popular" className="rounded-lg gap-2 text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white font-bold text-xs uppercase tracking-wider transition-all">
                    <Flame className="h-3.5 w-3.5" /> Hot
                  </TabsTrigger>
                  <TabsTrigger value="live" className="rounded-lg gap-2 text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-bold text-xs uppercase tracking-wider transition-all">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Radio className="h-3.5 w-3.5" />
                    </motion.div> Live
                  </TabsTrigger>
                  <TabsTrigger value="all" className="rounded-lg gap-2 text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white font-bold text-xs uppercase tracking-wider transition-all">
                    <CalendarDays className="h-3.5 w-3.5" /> Cards
                  </TabsTrigger>
                </TabsList>

                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="FILTER BY TEAM, LEAGUE OR TOURNAMENT..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white border-2 border-white/20 focus:border-white/40 focus:outline-none focus:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-xs font-bold tracking-wider uppercase placeholder:text-white/40 transition-all duration-300 backdrop-blur-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Grid Views */}
              {['popular', 'live', 'all'].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="outline-none mt-0">
                  {getIsLoading() ? (
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <motion.div 
                          key={i} 
                          className="aspect-video rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <SportsMatchGrid
                      matches={filterMatches(getCurrentMatches())}
                      emptyMessage={getEmptyMessage()}
                      backupStreamHref="https://rmppv.xyz"
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        <Footer />
        <Ads />
      </div>
    </PageTransition>
  );
};

export default Sports;
