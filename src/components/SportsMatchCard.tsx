import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { APIMatch } from '@/utils/sports-types';
import { getMatchPosterUrl } from '@/utils/sports-api';
import { format } from 'date-fns';
import { CalendarDays, ChevronRight, Clock3, Eye, Radio, Star } from 'lucide-react';
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
      <div className="flex flex-1 flex-col justify-between border-t border-slate-800 px-4 py-4">
        <div>
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">{match.league || match.category}</p><p className="mt-1 truncate text-xs text-slate-500">{match.title}</p></div><span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', isLive ? 'bg-rose-400/15 text-rose-200' : isFinished ? 'bg-slate-700 text-slate-400' : 'bg-cyan-400/10 text-cyan-200')}>{isLive ? <><span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" />Live</> : isFinished ? 'Final' : 'Upcoming'}</span></div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {(['home', 'away'] as const).map((side) => <React.Fragment key={side}><div className={cn('min-w-0 text-center', side === 'away' && 'col-start-3')}><p className="line-clamp-2 min-h-10 w-full text-sm font-black leading-5 text-white transition-colors group-hover:text-cyan-100">{match.teams?.[side].name || (side === 'home' ? 'Home side' : 'Away side')}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">{side === 'home' ? 'Home' : 'Away'}</p></div>{side === 'home' && <div className="col-start-2 row-start-1 flex flex-col items-center gap-1"><span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{isLive ? 'Now' : 'vs'}</span><span className="h-px w-6 bg-cyan-300/50" /></div>}</React.Fragment>)}
          </div>
        </div>
        <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400"><span className="flex items-center gap-1.5">{isLive ? <Radio className="h-3.5 w-3.5 text-rose-300" /> : isFinished ? <CalendarDays className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5 text-cyan-300" />}{isLive ? 'Streaming now' : format(matchTime, 'EEE, MMM d · h:mm a')}</span><span className="flex items-center gap-1 text-slate-500"><Eye className="h-3.5 w-3.5" />{match.sources?.length || 0}</span></div>
        <div className="mt-3 flex items-center justify-between text-xs font-bold"><span className="flex items-center gap-1.5 text-slate-300">{match.popular && <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />}{match.popular ? 'Featured match' : 'View match details'}</span><ChevronRight className="h-4 w-4 text-cyan-300 transition-transform group-hover:translate-x-1" /></div>
        </div>
      </div>
    </article>
  </Link>;
};

export default memo(SportsMatchCard);
