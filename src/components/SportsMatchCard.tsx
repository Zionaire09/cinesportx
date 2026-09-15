import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APIMatch } from '@/utils/sports-types';
import { getMatchPosterUrl } from '@/utils/sports-api';
import { format } from 'date-fns';
import { CalendarDays, Clock3, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SportMatchCardProps { match: APIMatch; className?: string }

const SportsMatchCard = ({ match, className }: SportMatchCardProps) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  const matchTime = new Date(match.date);
  const is24Seven = matchTime.getFullYear() <= 1970 || (matchTime.getMonth() === 0 && matchTime.getDate() === 1);
  const isLive = !is24Seven && (match.status === 'live' || (match.status !== 'finished' && matchTime.getTime() <= now && now - matchTime.getTime() < 3 * 60 * 60 * 1000));
  const isFinished = !is24Seven && (match.status === 'finished' || (!isLive && matchTime.getTime() < now));
  const isUpcoming = !is24Seven && !isLive && !isFinished;
  const state = is24Seven || isLive ? 'live' : isFinished ? 'finished' : 'upcoming';
  const secondsUntilStart = Math.max(0, Math.floor((matchTime.getTime() - now) / 1000));
  const days = Math.floor(secondsUntilStart / 86400);
  const hours = Math.floor((secondsUntilStart % 86400) / 3600);
  const minutes = Math.floor((secondsUntilStart % 3600) / 60);
  const countdown = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const hasTeams = Boolean(match.teams?.home.name && match.teams.away.name);
  const stateStyles = { live: 'border-cyan-400/40 shadow-cyan-950/20', upcoming: 'border-slate-700 hover:border-cyan-400/50', finished: 'border-slate-800 opacity-90' };
  return <Link to={`/sports/player/${match.id}`} className={cn('group block h-full', className)}><article className={cn('flex h-full min-h-[288px] flex-col overflow-hidden rounded-2xl border bg-[#0e1b2c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl', stateStyles[state])}>
    <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.22),transparent_45%),linear-gradient(135deg,#142a42,#081321)]"><img src={match.poster ? getMatchPosterUrl(match.poster) : '/no-match-photo.png'} alt={match.poster ? '' : 'No match photo available'} className="pointer-events-none absolute inset-0 h-full w-full object-cover" loading="lazy" /></div>
    <div className="flex min-h-[112px] flex-col justify-between border-t border-slate-800 px-3 py-2.5"><div className="min-w-0 text-center"><p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300">{match.league || match.category}</p>{hasTeams ? <p className="mt-1 truncate text-base font-black tracking-tight text-white transition-colors group-hover:text-cyan-100 md:text-lg">{match.teams?.home.name} <span className="px-1 text-cyan-300">vs</span> {match.teams?.away.name}</p> : <p className="mt-1 truncate text-sm font-black tracking-tight text-white transition-colors group-hover:text-cyan-100 md:text-base">{match.title}</p>}</div><div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-2 text-[10px] text-slate-400"><span className="flex min-w-0 items-center gap-1.5 truncate">{is24Seven || isLive ? <Radio className="h-3 w-3 shrink-0 text-cyan-300" /> : isFinished ? <CalendarDays className="h-3 w-3 shrink-0" /> : <Clock3 className="h-3 w-3 shrink-0 text-cyan-300" />}{is24Seven ? '24/7 live stream' : isLive ? 'Streaming now' : isUpcoming ? `Starts in ${countdown}` : format(matchTime, 'MMM d · h:mm a')}</span><span className={cn('shrink-0 rounded-full px-2 py-1 font-black uppercase tracking-wider', is24Seven || isLive ? 'bg-cyan-400/15 text-cyan-200' : isFinished ? 'bg-slate-700 text-slate-400' : 'bg-cyan-400/10 text-cyan-200')}>{is24Seven ? '24/7' : isLive ? <><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />Live</> : isFinished ? 'Final' : 'Upcoming'}</span><span className="shrink-0 text-xs font-black text-cyan-200">{match.sources?.length || 0} streams</span></div></div>
  </article></Link>;
};
export default memo(SportsMatchCard);
