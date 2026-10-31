import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { getMatchById, getStreamsForMatch } from '@/utils/sports-api';
import { Stream } from '@/utils/sports-types';
import Ads from '@/components/Ads';
import SportsBanner from '@/components/SportsBanner';
import SharePromotion from '@/components/SharePromotion';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, RefreshCw, Signal, ExternalLink, ArrowLeft, Maximize2, Minimize2, ChevronDown, Clock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const BACKUP_STREAM_URL = 'https://rmppv.xyz';
const BackupStreamLink = () => <a href={BACKUP_STREAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-[10px] sm:px-4 sm:py-2.5 sm:text-xs font-black uppercase tracking-wider text-cyan-100 transition-all hover:border-cyan-200/80 hover:bg-cyan-400/20 hover:text-white">Try rmppv.xyz backup stream <ExternalLink className="h-3.5 w-3.5" /></a>;

const HlsVideo = ({ source, title, onReady }: { source: string; title: string; onReady: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    let hls: { destroy: () => void } | undefined;
    let cancelled = false;
    setPlaybackError(false);

    const connect = async () => {
      const isHls = /\.m3u8(?:$|[?#])/i.test(source) || /application\/vnd\.apple\.mpegurl/i.test(source);
      if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
        try {
          // @ts-expect-error The browser resolves this optional CDN module at runtime.
          const module = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/+esm') as { default: { isSupported: () => boolean; new (options: { enableWorker: boolean; lowLatencyMode: boolean; backBufferLength: number }): { loadSource: (url: string) => void; attachMedia: (element: HTMLVideoElement) => void; on: (event: string, callback: (_event: unknown, data: { fatal?: boolean }) => void) => void; destroy: () => void } } };
          if (cancelled) return;
          const Hls = module.default;
          if (Hls.isSupported()) {
            const instance = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
            hls = instance;
            instance.loadSource(source);
            instance.attachMedia(video);
            instance.on('hlsError', (_event, data) => {
              if (data.fatal) setPlaybackError(true);
            });
            return;
          }
        } catch {
          setPlaybackError(true);
          return;
        }
      }
      video.src = source;
    };

    void connect();
    return () => {
      cancelled = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [source]);

  return <div className="relative h-full w-full"><video ref={videoRef} controls autoPlay playsInline className="h-full w-full bg-black object-contain" aria-label={title} onLoadedData={onReady} onError={() => setPlaybackError(true)} />{playbackError && <div className="absolute inset-x-0 bottom-0 bg-black/80 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-rose-200">This sports stream could not be played in this browser. Try refreshing or choose another source.</div>}</div>;
};

const SportMatchPlayer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams<{ matchId?: string; '*': string }>();
  const rawMatchId = params['*'] || params.matchId || '';
  const matchId = (() => {
    try {
      return decodeURIComponent(rawMatchId);
    } catch {
      return rawMatchId;
    }
  })();
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedStreamNo, setSelectedStreamNo] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['match-info', matchId],
    queryFn: () => matchId ? getMatchById(matchId) : Promise.resolve(null),
    enabled: Boolean(matchId),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  });
  const { data: streamData, isLoading: streamsLoading, refetch: refetchStreamsData } = useQuery({
    queryKey: ['match-streams', matchId],
    queryFn: () => matchData ? getStreamsForMatch(matchData) : Promise.resolve({ activeSources: [], groupedStreams: {} }),
    enabled: Boolean(matchId && matchData),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  });
  const activeSources = streamData?.activeSources || [];
  const groupedStreams = streamData?.groupedStreams || {};

  useEffect(() => {
    if (!selectedSource && activeSources[0]) setSelectedSource(activeSources[0].source);
    if (selectedSource && !activeSources.some((source) => source.source === selectedSource)) {
      setSelectedSource(activeSources[0]?.source || '');
      setSelectedStreamNo(1);
    }
  }, [activeSources, selectedSource]);

  const currentStreams = selectedSource ? (groupedStreams[selectedSource] || []) : [];
  const currentStream: Stream | undefined = currentStreams.find((stream) => stream.streamNo === selectedStreamNo) || currentStreams[0];
  const embedUrl = currentStream?.embedUrl || '';

  useEffect(() => {
    if (selectedSource && currentStream) {
      setIsLoadingPlayer(true);
      setIframeKey((value) => value + 1);
    }
  }, [selectedSource, selectedStreamNo, embedUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) setShowSourceDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleSourceChange = (sourceInfo: { source: string }) => {
    setSelectedSource(sourceInfo.source);
    setSelectedStreamNo(1);
    setShowSourceDropdown(false);
    toast({ title: 'SERVER CHANGED', description: `Now using ${sourceInfo.source.toUpperCase()}.` });
  };

  const handleStreamChange = (streamNo: number) => {
    setSelectedStreamNo(streamNo);
    toast({ title: 'STREAM CHANGED', description: `Now playing stream ${streamNo}.` });
  };

  const handleRefresh = () => {
    setIsLoadingPlayer(true);
    setIframeKey((value) => value + 1);
    void refetchStreamsData();
    toast({ title: 'STREAMS REFRESHED', description: 'Checking for the latest available streams.' });
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!isFullscreen) void playerRef.current.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  const isLoading = matchLoading || streamsLoading;
  const hasActiveSources = activeSources.length > 0;

  if (isLoading) return <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"><Loader2 className="mb-2 h-8 w-8 animate-spin text-white" /><span className="text-[10px] font-black uppercase tracking-widest text-white/60">Loading match streams...</span></div>;
  if (!matchData) return <PageTransition><div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-200"><Navbar /><main className="flex min-h-[70vh] items-center justify-center px-4 pt-24"><div className="flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center"><Signal className="mb-4 h-8 w-8 text-cyan-300" /><h1 className="text-xl font-black text-white">This match is unavailable.</h1><p className="mt-2 text-sm text-white/60">The live sports catalogue did not return metadata for this event.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={() => navigate('/sports')} className="border border-cyan-300/40 bg-cyan-400/10 text-xs font-bold uppercase tracking-wider text-cyan-100">Back to sports</Button><BackupStreamLink /></div></div></main><Footer /></div></PageTransition>;

  const title = matchData.title || 'Sports match';
  const matchDate = matchData.date && new Date(matchData.date).getTime() > 0 ? format(new Date(matchData.date), 'MMM d, yyyy • h:mm a') : 'Live stream';

  return <PageTransition><div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-200 antialiased"><Navbar /><div className="px-0 pb-10 pt-20 sm:px-4 sm:pb-16 sm:pt-24 md:px-6"><div className="container mx-auto max-w-7xl"><SportsBanner />
    <div className="mx-2 mb-2 flex items-center justify-between sm:mx-0 sm:mb-5"><button onClick={() => navigate('/sports')} className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-[10px] sm:px-4 sm:py-2.5 sm:text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:border-cyan-200"><ArrowLeft className="h-4 w-4" /> Back</button><span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] text-white/60">MATCH {matchData.id.slice(0, 8)}</span></div>
    <motion.header className="mx-0 mb-3 rounded-xl sm:mx-0 sm:mb-5 sm:rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.12] to-blue-500/[0.08] px-3 py-3 text-center sm:px-5 sm:py-5 shadow-xl" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}><p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">{matchData.category || 'Sports'}{matchData.league ? ` • ${matchData.league}` : ''}</p><h1 className="mt-2 text-lg font-black sm:text-2xl tracking-tight text-white md:text-4xl">{title}</h1><p className="mt-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60"><Clock className="h-3.5 w-3.5" />{matchDate}</p></motion.header>
    <div className="w-full grid items-start gap-2 lg:gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(250px,1fr)]">
      <main className="w-full min-w-0 space-y-2 sm:space-y-5"><motion.div ref={playerRef} className={`w-full max-w-full min-w-0 overflow-hidden sm:w-auto sm:max-w-none rounded-none border-y-2 border-white/25 bg-black shadow-[0_0_35px_rgba(0,0,0,0.9)] sm:rounded-2xl sm:border sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] ${isFullscreen ? '!fixed !inset-0 !z-[9999] !m-0 !h-[100dvh] !w-screen !max-w-none !flex !flex-col !overflow-hidden !rounded-none !border-0 !p-0 !shadow-none' : ''}`} style={isFullscreen ? { height: '100dvh', width: '100vw', maxWidth: 'none' } : undefined} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`relative aspect-video ${isFullscreen ? 'min-h-0 flex-1 !aspect-auto' : ''}`}>{embedUrl ? currentStream?.streamType === 'video' ? <HlsVideo key={iframeKey} source={embedUrl} title={title} onReady={() => setIsLoadingPlayer(false)} /> : <><iframe key={iframeKey} src={embedUrl} className="absolute inset-0 h-full w-full" title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" allowFullScreen onLoad={() => setIsLoadingPlayer(false)} />{isLoadingPlayer && <div className="absolute inset-0 flex items-center justify-center bg-black/95 p-6"><div className="flex flex-col items-center gap-3"><Loader2 className="h-6 w-6 animate-spin text-white/60" /><span className="text-[10px] font-black uppercase tracking-widest text-white/60">Connecting to stream...</span></div></div>}</> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6"><div className="flex max-w-sm flex-col items-center text-center"><Signal className="mb-3 h-7 w-7 text-white/50" /><p className="mb-4 text-xs font-black uppercase tracking-wider text-white">No streams are available for this match</p><div className="flex flex-wrap justify-center gap-3"><Button onClick={handleRefresh} size="sm" className="border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold uppercase tracking-wider text-white">Refresh streams</Button><BackupStreamLink /></div></div></div>}</div>{embedUrl && <div className="flex items-center justify-between border-t border-white/20 bg-white/5 px-4 py-3 text-xs uppercase tracking-wide"><span className="truncate text-white/70"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-300" />{selectedSource} • stream {currentStream?.streamNo}</span><Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0 text-white/60 hover:text-white">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button></div>}</motion.div>
        <motion.div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/[0.08] px-4 py-3 shadow-lg md:px-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Live sports backup</p><p className="mt-1 text-sm font-black text-white">Having trouble with this stream?</p><p className="mt-1 text-xs text-cyan-100/75">Try rmppv.xyz for another live sports stream.</p></div><a href={BACKUP_STREAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-white">Open rmppv.xyz <ExternalLink className="h-3.5 w-3.5" /></a></div></motion.div>
        <SharePromotion kind="sports" sportsTone="cyan" />
        <a href="https://rmppv.xyz/replays" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.07] px-4 py-4 transition hover:border-cyan-300/60 hover:bg-cyan-400/10 md:px-5"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950"><Clock className="h-5 w-5" /></span><span><span className="block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Missed a match?</span><span className="block text-base font-black text-white md:text-lg">Catch up on sports replays</span><span className="block text-xs font-bold text-cyan-100/75">rmppv.xyz/replays</span></span></span><ExternalLink className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1" /></a>
      </main>
      <aside className="mx-0 rounded-xl p-3 sm:mx-0 sm:rounded-2xl sm:p-4 border border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.14] to-blue-600/[0.12] shadow-xl backdrop-blur-sm lg:sticky lg:top-24"><div className="mb-3 sm:mb-5"><h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white"><Wifi className="h-4 w-4 text-cyan-300" />Stream Server Controls</h2><p className="mt-2 text-[11px] leading-5 text-white/60">Switch servers or refresh the available streams when playback needs a new signal.</p></div>{hasActiveSources && <div className="mb-3 space-y-2 sm:mb-5"><label className="text-[10px] font-black uppercase tracking-widest text-white/60">Active server</label><div className="relative" ref={sourceDropdownRef}><button onClick={() => setShowSourceDropdown(!showSourceDropdown)} className="flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-left sm:py-3 transition hover:border-cyan-300/60"><span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white"><Wifi className="h-4 w-4 text-cyan-300" />{selectedSource || 'Select server'}</span><ChevronDown className={`h-4 w-4 text-white/60 transition ${showSourceDropdown ? 'rotate-180' : ''}`} /></button><AnimatePresence>{showSourceDropdown && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/25 bg-slate-900/95 shadow-2xl backdrop-blur">{activeSources.map((source) => <button key={source.source} onClick={() => handleSourceChange(source)} className="flex w-full items-center justify-between border-b border-white/10 px-3 py-3 text-left text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-400/15">{source.source}{selectedSource === source.source && <Check className="h-4 w-4 text-cyan-300" />}</button>)}</motion.div>}</AnimatePresence></div></div>}{selectedSource && currentStreams.length > 1 && <div className="mb-3 space-y-2 sm:mb-5"><label className="text-[10px] font-black uppercase tracking-widest text-white/60">Available streams</label><div className="grid gap-2">{currentStreams.map((stream, index) => <button key={stream.streamNo} onClick={() => handleStreamChange(stream.streamNo || index + 1)} className={`rounded-xl border px-3 py-3 text-left transition ${selectedStreamNo === stream.streamNo ? 'border-cyan-300/70 bg-cyan-400/20 text-white shadow-lg' : 'border-white/15 bg-white/5 text-white/65 hover:border-cyan-300/40'}`}><span className="block text-xs font-black uppercase tracking-wider">Stream {index + 1}</span><span className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-wider opacity-60">{stream.language?.trim() || stream.quality || 'Standard'}{stream.hd && ' • HD'}</span></button>)}</div></div>}<Button onClick={handleRefresh} className="h-10 w-full sm:h-11 rounded-xl border border-cyan-300/50 bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:from-cyan-500 hover:to-blue-500"><RefreshCw className="h-3.5 w-3.5" />Refresh streams</Button></aside>
    </div></div></div><Ads /><Footer /></div></PageTransition>;
};
export default SportMatchPlayer;
