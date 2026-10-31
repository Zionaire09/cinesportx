import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Maximize2, Radio, RefreshCw, Signal, Tv2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import Ads from '@/components/Ads';
import AdBanners from '@/components/AdBanners';
import { countryName, LiveChannel } from '@/utils/live-tv';

const isYouTubeUrl = (url: string) => /(?:youtube\.com|youtu\.be)/i.test(url);

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get('v')
      || parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/i)?.[1]
      || (parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1).split('/')[0] : '');
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    const channelId = parsed.pathname.match(/\/channel\/(UC[\w-]+)/i)?.[1];
    if (channelId) return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`;
  } catch {
    return '';
  }
  return '';
};

const LiveTVPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'connecting' | 'playing' | 'error' | 'unsupported' | 'youtube'>('connecting');
  const [refreshKey, setRefreshKey] = useState(0);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search, refreshKey]);
  const channel: LiveChannel = {
    id: params.get('id') || '', name: params.get('name') || 'Live TV channel', url: params.get('url') || '', country: params.get('country') || '', language: params.get('language') || '', category: params.get('category') || 'General', logo: params.get('logo') || '', status: 'live',
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!channel.url) return;
    let hls: { destroy: () => void } | undefined;
    let cancelled = false;
    const start = async () => {
      setState('connecting');
      if (isYouTubeUrl(channel.url)) {
        setState(getYouTubeEmbedUrl(channel.url) ? 'youtube' : 'unsupported');
        return;
      }
      if (!video) return;
      video.removeAttribute('src');
      video.load();
      if (!channel.url.includes('.m3u8')) { setState('unsupported'); return; }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.onloadedmetadata = () => !cancelled && setState('playing');
        video.onerror = () => !cancelled && setState('error');
        video.play().catch(() => undefined);
        return;
      }
      try {
        const module = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/+esm');
        if (cancelled || !module.default?.isSupported()) { setState('unsupported'); return; }
        const instance = new module.default({ enableWorker: true });
        hls = instance;
        instance.loadSource(channel.url);
        instance.attachMedia(video);
        instance.on(module.default.Events.MANIFEST_PARSED, () => { if (!cancelled) { setState('playing'); video.play().catch(() => undefined); } });
        instance.on(module.default.Events.ERROR, (_event: unknown, data: { fatal?: boolean }) => { if (!cancelled && data.fatal) setState('error'); });
      } catch { if (!cancelled) setState('unsupported'); }
    };
    start();
    return () => { cancelled = true; hls?.destroy(); video?.pause(); video?.removeAttribute('src'); video?.load(); };
  }, [channel.url, refreshKey]);

  const toggleFullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else playerRef.current?.requestFullscreen(); };
  const youtubeEmbedUrl = getYouTubeEmbedUrl(channel.url);
  const stateCopy = { connecting: 'Connecting to the public signal…', playing: 'Signal connected', youtube: 'YouTube player ready', error: 'Signal unavailable', unsupported: 'Source format not supported' }[state];
  const hint = { connecting: 'Your browser is contacting the original broadcaster.', playing: 'Playback is connected directly to the listed stream.', youtube: 'This source is playing through YouTube.', error: 'The feed may be offline, geo-restricted, or temporarily rate-limited.', unsupported: 'Open the original source directly. This player supports HLS and YouTube links.' }[state];

  return <PageTransition><div className="min-h-screen bg-gradient-to-br from-[#07101d] via-[#0a1425] to-[#07101d] text-slate-100"><Navbar /><main className="relative overflow-hidden pb-20 pt-24 md:pt-28"><div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_70%_5%,rgba(79,110,255,0.2),transparent_42%)]" /><div className="relative mx-auto max-w-7xl px-0 sm:px-4 md:px-8"><div className="mb-4 flex items-center justify-between px-4 sm:px-0"><button type="button" onClick={() => navigate('/live-tv')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-white/75 transition hover:border-indigo-300/50 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Live TV</button><span className="rounded-xl border border-indigo-300/20 bg-indigo-300/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">Public relay</span></div><AdBanners /><div className="grid items-start gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(260px,1fr)]"><section className="min-w-0"><div ref={playerRef} className="overflow-hidden border-y border-white/15 bg-black shadow-2xl sm:rounded-2xl sm:border"><div className="relative aspect-video">{youtubeEmbedUrl ? <iframe key={`${youtubeEmbedUrl}-${refreshKey}`} src={youtubeEmbedUrl} className="absolute inset-0 h-full w-full" title={channel.name} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video ref={videoRef} className="h-full w-full bg-black object-contain" controls playsInline />}<div className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/80 to-black/80 transition-opacity ${youtubeEmbedUrl || state === 'playing' || state === 'youtube' ? 'opacity-0' : 'opacity-100'}`}><div className="flex max-w-sm flex-col items-center px-6 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-300/40 bg-indigo-300/10">{state === 'error' ? <Signal className="h-6 w-6 text-rose-200" /> : <Radio className={`h-6 w-6 text-indigo-200 ${state === 'connecting' ? 'animate-pulse' : ''}`} />}</div><p className="text-sm font-bold text-white">{stateCopy}</p><p className="mt-2 text-xs leading-5 text-slate-400">{hint}</p></div></div></div><div className="flex items-center justify-between border-t border-white/10 bg-white/[0.04] px-4 py-3 text-xs"><span className="flex min-w-0 items-center gap-2 truncate text-white/70"><span className={`h-2 w-2 shrink-0 rounded-full ${youtubeEmbedUrl || state === 'playing' || state === 'youtube' ? 'bg-emerald-300 shadow-[0_0_10px_#6ee7b7]' : 'bg-amber-300'}`} /> {channel.name}</span><button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-2 text-white/60 transition hover:text-white"><Maximize2 className="h-4 w-4" /> Fullscreen</button></div></div><div className="mt-4 rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.07] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Playback note</p><p className="mt-1 text-sm font-bold text-white">Having trouble with this signal?</p><p className="mt-1 text-xs leading-5 text-slate-400">Public channels can go offline or be blocked in certain regions. Refresh once, then try another channel if needed.</p></div><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200/40 bg-indigo-300/10 px-4 py-2.5 text-xs font-bold text-indigo-100 hover:bg-indigo-300/20"><RefreshCw className="h-3.5 w-3.5" /> Refresh signal</button></div></div></section><aside className="mx-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:mx-0 lg:sticky lg:top-24"><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-1.5">{channel.logo ? <img src={channel.logo} alt="" className="h-full w-full object-contain" /> : <Tv2 className="h-6 w-6 text-indigo-400" />}</div><div className="min-w-0"><p className="truncate text-lg font-bold text-white">{channel.name}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-200">{countryName([], channel.country)} · {channel.category}</p></div></div><div className="my-5 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Language</p><p className="mt-1 truncate text-sm font-bold text-white">{channel.language || 'Open signal'}</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Format</p><p className="mt-1 text-sm font-bold text-white">{youtubeEmbedUrl ? 'YouTube' : 'HLS / M3U8'}</p></div></div><a href={channel.url || '#'} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-bold text-white/80 transition hover:border-indigo-300/50 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> Open original source</a><p className="mt-4 text-xs leading-5 text-slate-500">RabbitMeow does not host or re-encode this stream. Rights and availability remain with the original broadcaster.</p></aside></div></div></main><Footer /><Ads /></div></PageTransition>;
};

export default LiveTVPlayer;
