import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, RefreshCw, Search, Tv2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import Ads from '@/components/Ads';
import { channelKey, countryName, fetchCountryChannels, fetchCountries, LIVE_TV_SOURCES, LiveChannel, LiveCountry } from '@/utils/live-tv';

const FAVORITES_KEY = 'rabbitv3:live-tv:favorites';

const LiveTV = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<LiveCountry[]>([]);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [country, setCountry] = useState('US');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChannels = async (nextCountry: string) => {
    setIsLoading(true);
    setError('');
    try {
      setChannels(await fetchCountryChannels(nextCountry));
    } catch {
      setChannels([]);
      setError('The public channel directory is temporarily unavailable. Try refreshing in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => setError('Country metadata could not be loaded.'));
    loadChannels(country);
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(channels.map((channel) => channel.category).filter(Boolean))).sort()], [channels]);
  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase();
    return channels.filter((channel) => {
      const haystack = `${channel.name} ${channel.language} ${channel.category} ${channel.country}`.toLowerCase();
      return (!query || haystack.includes(query)) && (category === 'All' || channel.category === category) && (!showFavorites || favorites.includes(channelKey(channel)));
    });
  }, [category, channels, favorites, search, showFavorites]);

  const toggleFavorite = (channel: LiveChannel) => {
    const key = channelKey(channel);
    setFavorites((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const openPlayer = (channel: LiveChannel) => {
    const params = new URLSearchParams({ id: channel.id, name: channel.name, url: channel.url, country: channel.country, language: channel.language, category: channel.category, logo: channel.logo });
    navigate(`/live-tv/player?${params.toString()}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#07101d] via-[#0a1425] to-[#07101d] text-slate-100">
        <Navbar />
        <main className="relative overflow-hidden pb-20 pt-24 md:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_80%_0%,rgba(79,110,255,0.18),transparent_42%)]" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8">
            <section className="mb-7 rounded-2xl border border-white/10 bg-black/20 p-3 shadow-xl md:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative min-w-0 flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search channels, languages, or categories..." className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/60 focus:ring-2 focus:ring-indigo-300/10" /></label>
                <select value={country} onChange={(event) => { setCountry(event.target.value); setCategory('All'); loadChannels(event.target.value); }} className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none focus:border-indigo-300/60"><option value="">Choose country</option>{countries.map((item) => <option key={item.code} value={item.code}>{item.flag || ''} {item.name}</option>)}</select>
                <button type="button" onClick={() => setShowFavorites((current) => !current)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${showFavorites ? 'border-rose-300/60 bg-rose-300/15 text-rose-100' : 'border-white/10 bg-white/[0.06] text-slate-300 hover:border-white/25 hover:text-white'}`}><Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} /> Saved {favorites.length > 0 && `(${favorites.length})`}</button>
                <button type="button" onClick={() => loadChannels(country)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-300/40 bg-indigo-300/10 px-4 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-300/20"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</button>
              </div>
              <div className="category-scroll mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${category === item ? 'border-indigo-200 bg-indigo-300 text-slate-950' : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-indigo-300/50 hover:text-white'}`}>{item}</button>)}</div>
            </section>

            {error && <div className="mb-6 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">{error}</div>}
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">{countryName(countries, country)} relay</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{showFavorites ? 'Saved signals' : 'Browse live channels'}</h2></div><span className="text-xs font-semibold text-slate-500">{filteredChannels.length.toLocaleString()} results</span></div>
            {isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}</div> : filteredChannels.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredChannels.slice(0, 160).map((channel) => { const saved = favorites.includes(channelKey(channel)); return <article key={`${channelKey(channel)}-${channel.url}`} className="group flex min-h-44 flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-4 transition hover:-translate-y-1 hover:border-indigo-300/60 hover:bg-indigo-300/[0.08]"><div className="flex items-start justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-1.5">{channel.logo ? <img src={channel.logo} alt="" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <Tv2 className="h-6 w-6 text-indigo-400" />}</div><button type="button" onClick={() => toggleFavorite(channel)} aria-label={saved ? 'Remove from saved' : 'Save channel'} className={`text-xl transition hover:scale-110 ${saved ? 'text-rose-300' : 'text-slate-600 hover:text-rose-200'}`}>{saved ? '♥' : '♡'}</button></div><div><h3 className="mt-5 truncate text-base font-bold text-white">{channel.name}</h3><div className="mt-2 flex items-center gap-2 truncate text-[10px] font-bold uppercase tracking-wider text-slate-500"><span className={`rounded-full px-2 py-1 ${channel.status === 'down' ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200'}`}>{channel.status === 'down' ? 'Check' : 'Live'}</span><span>{channel.language || 'Open signal'}</span><span>•</span><span>{channel.category || 'General'}</span></div><button type="button" onClick={() => openPlayer(channel)} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-200 transition hover:text-white"><Play className="h-3.5 w-3.5 fill-current" /> Watch channel</button></div></article>; })}</div> : <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center"><Tv2 className="mx-auto mb-3 h-8 w-8 text-slate-600" /><h3 className="text-lg font-bold text-white">No signals found</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Try another search or category. Public streams may also go offline or become geo-restricted.</p></div>}
            <p className="mt-8 text-xs leading-5 text-slate-500">RabbitMeow links to publicly listed streams and does not host or re-encode them. Availability and rights belong to the original broadcaster. Data directory: <a className="text-indigo-300 hover:text-white" href={LIVE_TV_SOURCES.directory} target="_blank" rel="noreferrer">iptv-org ↗</a>.</p>
          </div>
        </main>
        <Footer /><Ads />
      </div>
    </PageTransition>
  );
};

export default LiveTV;
