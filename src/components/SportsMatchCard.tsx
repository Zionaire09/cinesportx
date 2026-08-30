import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { APIMatch } from '@/utils/sports-types';
import { getMatchPosterUrl, getTeamBadgeUrl } from '@/utils/sports-api';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Radio, ShieldAlert, Zap, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getColorForSport } from '@/utils/sports-colors';

interface SportMatchCardProps {
  match: APIMatch;
  className?: string;
}

const SportMatchCard = ({ match, className }: SportMatchCardProps) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((badgeUrl: string) => {
    setFailedImages(prev => new Set(prev).add(badgeUrl));
  }, []);

  const now = new Date().getTime();
  const matchTime = new Date(match.date);
  const matchTimestamp = matchTime.getTime();

  const isLive = matchTimestamp <= now && (now - matchTimestamp < 3 * 60 * 60 * 1000);
  const isUpcoming = matchTimestamp > now;
  const matchId = match.id;

  // Determine color based on match category
  const sportColor = getColorForSport(match.category);

  return (
    <Link
      to={`/sports/player/${matchId}`}
      className={cn(
        "block group h-full select-none",
        className
      )}
    >
        <Card
          className={cn(
          "overflow-hidden h-full shadow-lg flex flex-col justify-between rounded-2xl border border-white/20 bg-gradient-to-br",
          sportColor.bg
        )}
        style={{
          background: sportColor.gradient,
          borderColor: sportColor.glow,
          boxShadow: `0 0 14px ${sportColor.glow}`
        }}
      >

        {/* Dynamic Canvas Area with Enhanced Effects */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center p-4 border-b border-white/20 overflow-hidden">
          {/* Animated Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0" />

          {match.poster && (
            <>
              <img
                src={getMatchPosterUrl(match.poster)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                loading="lazy"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-5" />
            </>
          )}

          <div className="absolute inset-0 bg-black/20 z-0" />

          {/* Versus Interface with Enhanced Styling */}
          {match.teams ? (
            <div
              className="relative z-10 w-full flex items-center justify-between gap-1"
            >
              {/* Home Team */}
              <div className="flex flex-col items-center text-center w-[45%]">
                <div
                  className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 p-3 flex items-center justify-center shadow-md relative"
                >
                  {!failedImages.has(match.teams.home.badge) ? (
                    <img
                      src={getTeamBadgeUrl(match.teams.home.badge)}
                      alt=""
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={() => handleImageError(match.teams.home.badge)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-lg">
                      <span className="text-[10px] font-black text-white/60 uppercase">N/A</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-black text-white truncate w-full mt-2.5 tracking-wide uppercase">
                  {match.teams.home.name}
                </span>
              </div>

              {/* VS Badge */}
              <div
                className="text-[10px] font-black tracking-widest text-white bg-gradient-to-r from-white/30 to-white/10 px-2 py-1 rounded border border-white/40"
              >
                VS
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center text-center w-[45%]">
                <div
                  className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 p-3 flex items-center justify-center shadow-md relative"
                >
                  {!failedImages.has(match.teams.away.badge) ? (
                    <img
                      src={getTeamBadgeUrl(match.teams.away.badge)}
                      alt=""
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={() => handleImageError(match.teams.away.badge)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-lg">
                      <span className="text-[10px] font-black text-white/60 uppercase">N/A</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-black text-white truncate w-full mt-2.5 tracking-wide uppercase">
                  {match.teams.away.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-center">
              <ShieldAlert className="h-8 w-8 text-white mx-auto mb-1" />
              <span className="text-[10px] font-black tracking-widest text-white bg-white/20 px-2 py-1 rounded uppercase">{match.category}</span>
            </div>
          )}

          {/* Floated Indicators with Enhanced Effects */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {isLive ? (
              <div>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500 to-cyan-500 text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-blue-100/40 shadow-[0_0_15px_rgba(56,189,248,0.55)] text-white">
                  ◉ LIVE
                </Badge>
              </div>
            ) : isUpcoming ? (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-white/40">
                ⏱️ PENDING
              </Badge>
            ) : match.popular ? (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-white/40 shadow-md">
                ⭐ TOP
              </Badge>
            ) : null}

            {/* Streaming Quality Indicator */}
            {match.sources && match.sources.length > 0 && (
              <div
                className="bg-white/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-white/40 text-white flex items-center gap-1"
              >
                <Zap className="h-3 w-3 text-yellow-300" />
                {match.sources.length}
              </div>
            )}
          </div>
        </div>

        {/* Info Deck with Enhanced Typography */}
        <CardContent className="p-4 bg-gradient-to-b from-white/10 to-white/5 flex-grow flex flex-col justify-between">
          <div>
            <div className="text-[9px] font-black tracking-widest text-white/90 uppercase mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              {match.league || match.category}
            </div>
            <h3 className="font-bold text-sm text-white line-clamp-2 tracking-wide">
              {match.title}
            </h3>
          </div>

          {/* Bottom Stats Bar with Hover Effects */}
          <div
            className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-[10px] font-bold text-white/80 tracking-wide uppercase"
          >
            <div className="flex items-center gap-1.5">
              {isLive ? (
                <>
                  <div>
                    <Radio className="h-3 w-3 text-cyan-200" />
                  </div>
                  <span className="text-blue-100">Live Now</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(matchTime, { addSuffix: true })}</span>
                </>
              )}
            </div>

            <div
              className="bg-white/20 text-white/90 px-2 py-0.5 rounded font-mono text-[9px] border border-white/30 flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              {match.sources.length} NODES
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default memo(SportMatchCard);
