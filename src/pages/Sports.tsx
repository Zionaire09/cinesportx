import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SportsMatchGrid from '@/components/SportsMatchGrid';
import PageTransition from '@/components/PageTransition';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { APIMatch, getMatchState } from '@/utils/sports-types';
import { getAllMatches, SPORTS_CATEGORIES } from '@/utils/sports-api';
import { useToast } from '@/hooks/use-toast';
import Ads from '@/components/Ads';
import SportsBanner from '@/components/SportsBanner';
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Flame,
  Radio,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { data: allMatches = [], isLoading, error: sportsError } = useQuery({
    queryKey: ['sports-catalog'],
    queryFn: getAllMatches,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const is24SevenMatch = (match: APIMatch) => {
    if (match.alwaysLive) return true;
    const date = new Date(match.date);
    return date.getFullYear() <= 1970 || (date.getMonth() === 0 && date.getDate() === 1);
  };

  const isCompletedMatch = (match: APIMatch) => getMatchState(match) === 'finished';
  const activeMatches = useMemo(() => allMatches.filter((match) => !isCompletedMatch(match)), [allMatches]);
  const liveMatches = useMemo(
    () => activeMatches.filter((match) => !is24SevenMatch(match) && getMatchState(match) === 'live'),
    [activeMatches],
  );
  const upcomingMatches = useMemo(
    () => activeMatches.filter((match) => getMatchState(match) === 'upcoming').sort((a, b) => (a.startsAt || Infinity) - (b.startsAt || Infinity)),
    [activeMatches],
  );
  const featuredMatches = useMemo(
    () => [...liveMatches, ...upcomingMatches, ...activeMatches.filter(is24SevenMatch)],
    [activeMatches, liveMatches, upcomingMatches],
  );

  useEffect(() => {
    if (sportsError) {
      toast({ title: 'Unable to load sports', description: 'Please try again in a moment.', variant: 'destructive' });
    }
  }, [sportsError, toast]);

  const selectedMatches = useMemo(() => {
    if (selectedSport === 'all') return activeMatches;
    if (selectedSport === '247-streams') return activeMatches.filter(is24SevenMatch);
    return activeMatches.filter((match) => match.sportId === selectedSport);
  }, [activeMatches, selectedSport]);

  const currentMatches = useMemo(() => {
    const source = selectedSport === 'all' ? featuredMatches : selectedMatches;
    if (activeTab === '247') return source.filter(is24SevenMatch);
    if (activeTab === 'live') return source.filter((match) => !is24SevenMatch(match) && getMatchState(match) === 'live');
    if (activeTab === 'upcoming') return source.filter((match) => getMatchState(match) === 'upcoming');
    return source;
  }, [activeTab, featuredMatches, selectedMatches, selectedSport]);

  const filteredMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return currentMatches;
    return currentMatches.filter((match) => [match.title, match.league, match.category, match.teams?.home.name, match.teams?.away.name]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [currentMatches, searchQuery]);

  const emptyMessage = selectedSport === 'all'
    ? activeTab === 'live' ? 'No live matches are streaming right now.' : activeTab === 'popular' ? 'No featured matches are available right now.' : activeTab === '247' ? 'No 24/7 live streams are available right now.' : 'No upcoming matches are scheduled right now.'
    : `No ${SPORTS_CATEGORIES.find((sport) => sport.id === selectedSport)?.name || 'selected'} matches found.`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#07101d] text-slate-100 selection:bg-cyan-400/30">
        <Navbar />
        <main className="relative overflow-hidden pb-20 pt-24 md:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_75%_0%,rgba(17,116,147,0.22),transparent_44%),radial-gradient(circle_at_8%_10%,rgba(240,120,48,0.12),transparent_35%)]" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8">
            <motion.section className="mb-8 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0b1828] shadow-2xl shadow-black/20" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative px-5 py-7 md:px-9 md:py-10">
                <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[28px] border-cyan-400/5" />
                <div className="absolute right-20 top-10 hidden text-cyan-300/10 md:block"><Trophy className="h-36 w-36" /></div>
                <div className="relative max-w-2xl">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" /> RabbitMeow Sports Center</div>
                  <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Every match.<br /><span className="text-cyan-300">One place to watch.</span></h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">Follow the world’s biggest matchups with live signals, matches, and reliable stream access.</p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-200"><Radio className="h-3.5 w-3.5" /> {liveMatches.length} live now</div>
                    <div className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-300"><CalendarDays className="h-3.5 w-3.5 text-cyan-300" /> {upcomingMatches.length} upcoming</div>
                    <div className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-300"><Zap className="h-3.5 w-3.5 text-amber-300" /> Multi-source access</div>
                  </div>
                </div>
              </div>
            </motion.section>

            <SportsBanner className="mb-7" />

            <Link to="/replays" className="group mb-8 flex items-center justify-between rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.07] px-4 py-4 transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/10 md:px-5">
              <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-[#07101d]"><Sparkles className="h-5 w-5" /></span><span><span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Missed a match?</span><span className="block text-sm font-bold text-white md:text-base">Catch up on sports replays</span><span className="mt-0.5 block text-xs font-medium text-cyan-200/75">Browse the full replay archive</span></span></span><ChevronRight className="h-5 w-5 text-cyan-300 transition-transform group-hover:translate-x-1" />
            </Link>

            <section className="rounded-2xl border border-slate-800 bg-[#0a1524]/80 p-3 md:p-5">
              <div className="mb-5 flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-300" /><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-200">Browse the desk</h2></div>
              <div className="category-scroll mb-5 flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setSelectedSport('all')} className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${selectedSport === 'all' ? 'border-cyan-300 bg-cyan-300 text-[#07101d]' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-white'}`}>All sports</button>
                {SPORTS_CATEGORIES.map((sport) => <button key={sport.id} onClick={() => setSelectedSport(sport.id)} className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${selectedSport === sport.id ? 'border-cyan-300 bg-cyan-300 text-[#07101d]' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-white'}`}>{sport.name}</button>)}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 lg:flex-row lg:items-center lg:justify-between">
                  <TabsList className="grid h-11 w-full grid-cols-5 gap-1 rounded-xl bg-slate-900 p-1 lg:w-[620px]">
                    <TabsTrigger value="popular" className="gap-2 rounded-lg text-xs font-bold text-slate-500 data-[state=active]:bg-amber-400/15 data-[state=active]:text-amber-200"><Flame className="h-3.5 w-3.5" /> Featured</TabsTrigger>
                    <TabsTrigger value="live" className="gap-2 rounded-lg text-xs font-bold text-slate-500 data-[state=active]:bg-rose-400/15 data-[state=active]:text-rose-200"><Radio className="h-3.5 w-3.5" /> Live</TabsTrigger>
                    <TabsTrigger value="upcoming" className="gap-2 rounded-lg text-xs font-bold text-slate-500 data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-200"><CalendarDays className="h-3.5 w-3.5" /> Upcoming</TabsTrigger>
                    <TabsTrigger value="247" className="rounded-lg text-xs font-bold text-slate-500 data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-200">24/7</TabsTrigger>
                    <Link to="/replays" className="flex items-center justify-center rounded-lg text-xs font-bold text-slate-500 transition hover:bg-cyan-400/10 hover:text-cyan-200">Replays</Link>
                  </TabsList>
                  <label className="relative block w-full lg:max-w-sm"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search teams, leagues..." className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10" /></label>
                </div>
                {['popular', 'live', 'upcoming', '247'].map((tab) => <TabsContent key={tab} value={tab} className="mt-5 focus-visible:outline-none">{isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="aspect-[1.18] animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />)}</div> : <SportsMatchGrid matches={filteredMatches} emptyMessage={searchQuery ? 'No matches match your search.' : emptyMessage} backupStreamHref="https://rmppv.xyz" />}</TabsContent>)}
              </Tabs>
            </section>
          </div>
        </main>
        <Footer /><Ads />
      </div>
    </PageTransition>
  );
};

export default Sports;
