import { memo } from 'react';
import { Link } from 'react-router-dom';
import { APIMatch } from '@/utils/sports-types';
import { getMatchPosterUrl } from '@/utils/sports-api';
import { format } from 'date-fns';
import { CalendarDays, Clock3, Eye, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SportMatchCardProps { match: APIMatch; className?: string }

const SportsMatchCard = ({ match, className }: SportMatchCardProps) => {
  const matchTime = new Date(match.date);
  const isLive = match.status === 'live' || (match.status !== 'finished' && matchTime.getTime() <= Date.now() && Date.now() - matchTime.getTime() < 3 * 60 * 60 * 1000);
  const isFinished = match.status === 'finished' || (!isLive && matchTime.getTime() < Date.now());
  const state = isLive ? 'live' : isFinished ? 'finished' : 'upcoming';
  const stateStyles = { live: 'border-rose-400/40 shadow-rose-950/20', upcoming: 'border-slate-700 hover:border-cyan-400/50', finished: 'border-slate-800 opacity-90' };

  return <Link to={`/sports/player/${match.id}`} className={cn('group block h-full', className)}>
    <article className={cn('flex h-full min-h-[288px] flex-col overflow-hidden rounded-2xl border bg-[#0e1b2c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl', stateStyles[state])}>
      <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.22),transparent_45%),linear-gradient(135deg,#142a42,#081321)]">
        {match.poster && <img src={getMatchPosterUrl(match.poster)} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="flex min-h-[112px] flex-col justify-between border-t border-slate-800 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300">{match.league || match.category}</p>{match.teams?.home.name && match.teams.away.name ? <p className="mt-1 truncate text-xs font-bold text-slate-200">{match.teams.home.name} <span className="px-1 text-cyan-300">vs</span> {match.teams.away.name}</p> : <p className="mt-1 truncate text-xs text-slate-500">{match.title}</p>}</div><span className={cn('shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider', isLive ? 'bg-rose-400/15 text-rose-200' : isFinished ? 'bg-slate-700 text-slate-400' : 'bg-cyan-400/10 text-cyan-200')}>{isLive ? <><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" />Live</> : isFinished ? 'Final' : 'Upcoming'}</span></div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-400"><span className="flex items-center gap-1.5">{isLive ? <Radio className="h-3 w-3 text-rose-300" /> : isFinished ? <CalendarDays className="h-3 w-3" /> : <Clock3 className="h-3 w-3 text-cyan-300" />}{isLive ? 'Streaming now' : format(matchTime, 'MMM d · h:mm a')}</span><span className="flex items-center gap-1 text-slate-500"><Eye className="h-3 w-3" />{match.sources?.length || 0}</span></div>
      </div>
    </article>
  </Link>;
};

export default memo(SportsMatchCard);
