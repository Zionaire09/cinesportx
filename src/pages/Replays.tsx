import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ExternalLink, Film, Loader2, RefreshCw, Search, ShieldCheck, Tv } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Ads from '@/components/Ads';
import SportsBanner from '@/components/SportsBanner';

type ReplayServer = { name?: string; type?: string; url?: string };
type Replay = {
  title: string;
  id: string;
  category?: string;
  subcategory?: string;
  poster?: string;
  date?: number;
  dateString?: string;
  servers?: ReplayServer[];
};
type ReplayResponse = { success?: boolean; source?: string; data?: Replay[]; error?: string };

const REPLAY_API = '/replay-api/replays';
const REPLAY_API_TIMEOUT_MS = 10_000;
const CATEGORIES = ['All', 'Baseball', 'Football', 'Motorsport', 'Rugby'];

function normalizeReplays(value: unknown): Replay[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const replay = item as Record<string, unknown>;
    const id = String(replay.id ?? '').trim();
    if (!id) return [];
    const servers = Array.isArray(replay.servers)
      ? replay.servers
          .filter((server): server is Record<string, unknown> => Boolean(server && typeof server === 'object'))
          .map((server) => ({
            name: typeof server.name === 'string' ? server.name : undefined,
            type: typeof server.type === 'string' ? server.type : undefined,
            url: typeof server.url === 'string' ? server.url : undefined,
          }))
      : [];
    return [{
      title: typeof replay.title === 'string' && replay.title.trim() ? replay.title : 'Untitled replay',
      id,
      category: typeof replay.category === 'string' ? replay.category : undefined,
      subcategory: typeof replay.subcategory === 'string' ? replay.subcategory : undefined,
      poster: typeof replay.poster === 'string' ? replay.poster : undefined,
      date: typeof replay.date === 'number' ? replay.date : undefined,
      dateString: typeof replay.dateString === 'string' ? replay.dateString : undefined,
      servers,
    } satisfies Replay];
  });
}

async function fetchReplayCatalogue() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REPLAY_API_TIMEOUT_MS);
  try {
    return await fetch(REPLAY_API, { headers: { Accept: 'application/json' }, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function formatDate(replay: Replay) {
  const raw = replay.dateString || replay.date;
  if (!raw) return 'Date unavailable';
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function safePoster(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

function ReplayCard({ replay }: { replay: Replay }) {
  const href = `/replay/${encodeURIComponent(replay.id)}`;
  const serverCount = replay.servers?.filter((server) => server.url && /^https?:\/\//i.test(server.url)).length || 0;
  return (
    <Link to={href} className="group block h-full focus-visible:outline-none">
      <article className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1828] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-cyan-950/30 group-focus-visible:ring-2 group-focus-visible:ring-cyan-300">
        <div className="relative min-h-[176px] overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 bg-cover bg-center" style={safePoster(replay.poster) ? { backgroundImage: `url(${safePoster(replay.poster)})` } : undefined}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#07101d] via-[#07101d]/30 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#07101d]"><Tv className="h-3 w-3" /> Replay</span>
          <Film className="absolute bottom-4 right-4 h-9 w-9 text-cyan-200/25" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300"><span>{replay.category || 'Sports'}</span><span className="text-slate-600">•</span><span className="text-slate-500">{formatDate(replay)}</span></div>
          <h2 className="mt-2 line-clamp-2 min-h-[3.5rem] text-lg font-black leading-tight tracking-tight text-white transition-colors group-hover:text-cyan-100">{replay.title}</h2>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-[10px] font-bold text-slate-500"><span>{serverCount} {serverCount === 1 ? 'player' : 'players'}</span><span className="inline-flex items-center gap-1 text-cyan-200">Open replay <ExternalLink className="h-3.5 w-3.5" /></span></div>
        </div>
      </article>
    </Link>
  );
}

export function Replays() {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const response = await fetchReplayCatalogue();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = (await response.json()) as ReplayResponse;
      if (!Array.isArray(payload.data)) throw new Error(payload.error || 'Replay catalogue unavailable');
      setReplays(normalizeReplays(payload.data));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Replay catalogue unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return replays.filter((replay) => {
      const matchesCategory = category === 'All' || replay.category === category;
      const matchesQuery = !needle || `${replay.title} ${replay.category || ''} ${replay.subcategory || ''}`.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [replays, query, category]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#07101d] text-slate-100 selection:bg-cyan-400/30">
        <Navbar />
        <main className="relative overflow-hidden pb-20 pt-24 md:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_75%_0%,rgba(17,116,147,0.22),transparent_44%),radial-gradient(circle_at_8%_10%,rgba(240,120,48,0.12),transparent_35%)]" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-3"><Link to="/sports" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to sports</Link><button type="button" onClick={() => load(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/60 hover:text-white"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Updating' : 'Refresh'}</button></div>
            <section className="mb-7 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0b1828] px-5 py-8 shadow-2xl shadow-black/20 md:px-9 md:py-10"><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" /> Full-match archive</div><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">Replay the <span className="text-cyan-300">action.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">Browse the latest available games, races, highlights, and full-match recordings.</p></div><div className="md:text-right"><strong className="block text-4xl font-black text-cyan-200 md:text-5xl">{replays.length.toLocaleString()}</strong><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">available replays</span></div></div></section>
            <SportsBanner className="mb-7" />
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-xs text-cyan-100/80 sm:flex-row sm:items-center"><ShieldCheck className="h-5 w-5 shrink-0 text-cyan-300" /><span>Replay players are embedded directly from the provider. RabbitMeow does not download, store, or rehost replay media.</span></div>
            <section className="rounded-2xl border border-slate-800 bg-[#0a1524]/80 p-3 md:p-5"><div className="flex flex-col gap-4 border-b border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between"><div className="category-scroll flex gap-2 overflow-x-auto pb-1">{CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${category === item ? 'border-cyan-300 bg-cyan-300 text-[#07101d]' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-white'}`}>{item}</button>)}</div><label className="relative block w-full lg:max-w-sm"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams, events or leagues" className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10" /></label></div>
              {error && <div className="mt-5 flex items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs text-rose-100"><ShieldCheck className="h-4 w-4 shrink-0" /><span>Could not load the replay catalogue: {error}</span><button type="button" onClick={() => load()} className="ml-auto font-bold text-cyan-200">Try again</button></div>}
              <div className="mb-4 mt-5 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>Showing {visible.length.toLocaleString()} results</span><span className="hidden sm:inline">Select a card to open the player</span></div>
              {loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="h-[320px] animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />)}</div> : visible.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.slice(0, 120).map((replay) => <ReplayCard replay={replay} key={replay.id} />)}</div> : <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500"><CalendarDays className="mb-3 h-8 w-8" /><h2 className="text-lg font-bold text-white">No replays found</h2><p className="mt-2 text-sm">Try another search or category.</p></div>}
            </section>
          </div>
        </main>
        <Footer /><Ads />
      </div>
    </PageTransition>
  );
}

export function ReplayPlayer() {
  const { id: encodedId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = (() => { try { return decodeURIComponent(encodedId); } catch { return encodedId; } })();
  const [replays, setReplays] = useState<Replay[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReplayCatalogue().then(async (response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = (await response.json()) as ReplayResponse;
      setReplays(normalizeReplays(payload.data));
    }).catch((err) => setError(err instanceof Error ? err.message : 'Replay unavailable')).finally(() => setLoading(false));
  }, []);

  const replay = replays.find((item) => item.id === id);
  const servers = (replay?.servers || []).filter((server) => server.url && /^https?:\/\//i.test(server.url));
  const server = servers[selected] || servers[0];
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#07101d] text-slate-100"><div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-cyan-300" /><h1 className="mt-5 text-2xl font-black">Loading the replay.</h1><p className="mt-2 text-sm text-slate-400">Finding the available external players.</p></div></div>;
  if (error || !replay) return <div className="flex min-h-screen items-center justify-center bg-[#07101d] px-5 text-center text-slate-100"><div><Tv className="mx-auto h-9 w-9 text-cyan-300" /><h1 className="mt-5 text-3xl font-black">This replay is unavailable.</h1><p className="mt-2 text-sm text-slate-400">{error || 'The replay could not be found in the public catalogue.'}</p><button type="button" onClick={() => navigate('/replays')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-xs font-black text-[#07101d]"><ArrowLeft className="h-4 w-4" /> Return to replays</button></div></div>;

  return <PageTransition><div className="min-h-screen bg-[#07101d] text-slate-100"><Navbar /><main className="relative overflow-hidden pb-20 pt-24 md:pt-28"><div className="relative mx-auto max-w-6xl px-4 md:px-8"><div className="mb-5 flex items-center justify-between"><Link to="/replays" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/60 hover:text-white"><ChevronLeft className="h-4 w-4" /> All replays</Link><span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:flex"><span className="h-2 w-2 rounded-full bg-cyan-300" /> Replay player</span></div><SportsBanner className="mb-7" /><section className="overflow-hidden rounded-2xl border border-slate-700/70 bg-black shadow-2xl shadow-black/40"><div className="aspect-video min-h-[280px] md:min-h-[520px]">{server ? <iframe src={server.url} title={replay.title} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /> : <div className="flex h-full items-center justify-center text-center text-slate-500"><div><Tv className="mx-auto h-8 w-8" /><p className="mt-3 text-sm">No external player is listed for this replay.</p></div></div>}</div></section><section className="border-b border-slate-800 py-6"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{replay.category || 'Sports replay'}</div><h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">{replay.title}</h1><p className="mt-2 text-sm text-slate-400">{formatDate(replay)}{replay.subcategory ? ` · ${replay.subcategory}` : ''}</p></section>{servers.length > 1 && <div className="flex flex-col gap-3 border-b border-slate-800 py-5 text-xs text-slate-400 sm:flex-row sm:items-center"><span>Available players</span><div className="flex flex-wrap gap-2">{servers.map((item, index) => <button key={`${item.url}-${index}`} type="button" onClick={() => setSelected(index)} className={`rounded-lg border px-3 py-2 font-bold transition ${index === selected ? 'border-cyan-300 bg-cyan-300 text-[#07101d]' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-cyan-300/60 hover:text-white'}`}>{item.name || `Player ${index + 1}`}</button>)}</div></div>}<div className="mt-5 flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-xs text-slate-400"><ShieldCheck className="h-5 w-5 shrink-0 text-cyan-300" /><span>This page embeds the provider player directly. RabbitMeow does not download, store, or rehost replay media.</span></div></div></main><Footer /><Ads /></div></PageTransition>;
}
