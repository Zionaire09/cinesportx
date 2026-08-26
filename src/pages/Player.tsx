import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVDetails, videoSources, getSeasonDetails } from '@/utils/api';
import { MovieDetails, TVDetails, Episode } from '@/utils/types';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, ExternalLink, Film, Maximize2, Minimize2, Play, Server, Shuffle, SkipBack, SkipForward, Star, Tv, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Ads from '@/components/Ads';
import { AutoNextEpisode } from '@/components/AutoNextEpisode';

// Simple debounce and throttle implementations (no lodash dependency)
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const backdropSizes = {
  small: 'https://image.tmdb.org/t/p/w300',
  original: 'https://image.tmdb.org/t/p/original',
};



// Define types for video source origins
const SOURCE_ORIGINS: Record<string, string[]> = {
  'vidzee': ['https://player.vidzee.wtf'],
  'vidrock': ['https://vidrock.ru'],
  'vidsrc-wtf-1': ['https://www.vidsrc.wtf'],
  'vidsrc-wtf-2': ['https://www.vidsrc.wtf'],
  'vidlink': ['https://vidlink.pro'],
  'vidfast': [
    'https://vidfast.pro',
    'https://vidfast.in',
    'https://vidfast.io',
    'https://vidfast.me',
    'https://vidfast.net',
    'https://vidfast.pm',
    'https://vidfast.xyz',
    'https://vidfast.vc'
  ],
  'videasy': ['https://player.videasy.net'],
  'vidnest': ['https://vidnest.fun'],
  'vidup': ['https://vidup.to']
};



// Memoized Episode Card Component
const EpisodeCard = memo(({ 
  episode, 
  isCurrentEpisode, 
  onPlay, 
  onToggleDescription, 
  isExpanded,
  formatDate,
  isMobile 
}: { 
  episode: Episode; 
  isCurrentEpisode: boolean; 
  onPlay: (season: number, episode: number) => void;
  onToggleDescription: (id: number, e: React.MouseEvent) => void;
  isExpanded: boolean;
  formatDate: (date: string) => string;
  isMobile: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div
      className={cn(
        "group relative rounded-lg border cursor-pointer",
        "bg-gradient-to-br backdrop-blur-sm",
        isCurrentEpisode
          ? "from-accent/20 via-accent/10 to-transparent border-accent/50 shadow-lg shadow-accent/10"
          : "from-white/5 via-transparent to-transparent border-white/10 hover:border-white/20 hover:bg-white/5",
        isMobile ? "p-3" : "p-4"
      )}
      onClick={() => onPlay(episode.season_number, episode.episode_number)}
    >
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          {episode.still_path ? (
            <div className={cn(
              "relative rounded-lg overflow-hidden bg-gray-800",
              isMobile ? "w-16 h-16" : "w-20 h-20"
            )}>
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 to-transparent" />
              )}
              <img 
                src={`${backdropSizes.small}${episode.still_path}`} 
                alt={`${episode.name} still`}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className={cn(
              "rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center",
              isMobile ? "w-16 h-16" : "w-20 h-20"
            )}>
              <Play className={cn("text-white/40", isMobile ? "h-6 w-6" : "h-6 w-6")} />
            </div>
          )}
          
          {isCurrentEpisode && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn(
              "font-semibold truncate flex-1",
              isMobile ? "text-xs" : "text-sm"
            )}>
              <span className="text-accent/80 mr-1">
                E{episode.episode_number.toString().padStart(2, '0')}
              </span>
              {episode.name || 'Untitled Episode'}
            </h4>
            {episode.vote_average > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 flex-shrink-0">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                <span className="text-amber-300 font-medium text-[10px]">
                  {episode.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          {episode.air_date && (
            <div className="flex items-center text-[10px] text-white/60 mb-1.5">
              <Calendar className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
              <span className="truncate">{formatDate(episode.air_date)}</span>
            </div>
          )}
          
          <p className={cn(
            "text-[10px] text-white/70 mb-2",
            isExpanded ? "line-clamp-none" : "line-clamp-2"
          )}>
            {episode.overview || 'No description available.'}
          </p>
          
          {episode.overview && episode.overview.length > (isMobile ? 80 : 100) && (
            <button
              onClick={(e) => onToggleDescription(episode.id, e)}
              className="text-[10px] text-accent hover:text-accent/80 mb-2 transition-colors"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
          
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              className={cn(
                "transition-all duration-200",
                isMobile ? "h-7 text-[10px] px-2" : "h-8 text-xs",
                isCurrentEpisode
                  ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                  : "bg-white/10 hover:bg-white/20 text-white/90"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(episode.season_number, episode.episode_number);
              }}
            >
              <Play className={cn("mr-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
              {isCurrentEpisode ? 'Continue' : 'Play'}
            </Button>
          </div>
        </div>
      </div>
      
      {isCurrentEpisode && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 via-transparent to-transparent rounded-lg -z-10 blur-sm pointer-events-none" />
      )}
    </div>
  );
});

EpisodeCard.displayName = 'EpisodeCard';



const DEFAULT_STREAM_SOURCE = 'vidsrc-mov';

const getStreamPreferenceKey = (mediaId: string, isTV: boolean) =>
  `selectedVideoSource:${isTV ? 'tv' : 'movie'}:${mediaId}`;

const Player = () => {
  const { id, season, episode } = useParams<{ id: string; season?: string; episode?: string }>();
  const [title, setTitle] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_STREAM_SOURCE);
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [mediaDetails, setMediaDetails] = useState<MovieDetails | TVDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>(season || '1');
  const [autoNextEnabled, setAutoNextEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('autoNextEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isEpisodeMenuOpen, setIsEpisodeMenuOpen] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<number, boolean>>({});
  const [visibleEpisodesCount, setVisibleEpisodesCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCheckTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number>();

  const memoizedNavigate = useCallback(navigate, [navigate]);
  const memoizedToast = useCallback(toast, [toast]);


  const toggleEpisodeDescription = useCallback((episodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
    }, []);

  // Optimized load more episodes for mobile
  useEffect(() => {
    if (!isMobile || episodes.length <= visibleEpisodesCount) return;

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (!loadMoreTrigger) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleEpisodesCount < episodes.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleEpisodesCount(prev => Math.min(prev + 10, episodes.length));
            setIsLoadingMore(false);
          }, 100);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreTrigger);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    }, [isMobile, episodes.length, visibleEpisodesCount, isLoadingMore]);

  const getEmbedUrlForSource = useCallback((
    sourceKey: string,
    mediaId: number,
    sourceMediaType: 'movie' | 'tv',
    seasonNum?: number,
    episodeNum?: number
  ) => {
    const source = videoSources.find((item) => item.key === sourceKey);
    if (!source) return '';

    if (sourceMediaType === 'movie') {
      return source.getMovieUrl(mediaId);
    }

    return seasonNum && episodeNum
      ? source.getTVUrl(mediaId, seasonNum, episodeNum)
      : '';
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMediaDetails = async () => {
      if (!id || !isMounted) return;

      const isTVRoute = season !== undefined || episode !== undefined;
      const savedSource = localStorage.getItem(getStreamPreferenceKey(id, isTVRoute));
      const preferredSource = videoSources.some((source) => source.key === savedSource)
        ? savedSource!
        : DEFAULT_STREAM_SOURCE;

      setSelectedSource(preferredSource);
      setEmbedUrl('');
      setHasInitialized(false);

      if (!mediaDetails || parseInt(id, 10) !== mediaDetails.id) {
        setIsLoading(true);
        setMediaDetails(null);
        setEpisodes([]);
        setEmbedUrl('');
      }

      if (id === '1368337' || id === '969681') {
        navigate('/takedown', { replace: true });
        return;
      }
      try {
        const mediaId = parseInt(id, 10);
        if (mediaId === 1368337 || mediaId === 969681) {
          navigate('/takedown', { replace: true });
          return;
        }
        const isTV = season !== undefined || episode !== undefined;
        const detectedMediaType = isTV ? 'tv' : 'movie';
        
        setMediaType(detectedMediaType);

        const seasonNum = season ? parseInt(season, 10) : 1;
        const episodeNum = episode ? parseInt(episode, 10) : 1;

        if (detectedMediaType === 'movie') {
          const movieDetails = await getMovieDetails(mediaId);
          if (movieDetails && isMounted) {
            setTitle(movieDetails.title || 'Untitled Movie');
            setMediaDetails(movieDetails);
          }
        } else {
          if (isNaN(seasonNum) || isNaN(episodeNum)) {
            memoizedNavigate(`/player/tv/${id}/1/1`, { replace: true });
            return;
          }

          const tvDetails = await getTVDetails(mediaId);
          if (tvDetails && isMounted) {
            const seasonData = await getSeasonDetails(mediaId, seasonNum);
            if (isMounted) {
              setEpisodes(seasonData);
              const currentEpisodeNumber = episodeNum;
              const episodeIndex = seasonData.findIndex(ep => ep.episode_number === currentEpisodeNumber);
              setCurrentEpisodeIndex(episodeIndex !== -1 ? episodeIndex : 0);
              
              const episodeTitle = seasonData.find(ep => ep.episode_number === currentEpisodeNumber)?.name || '';
              setTitle(`${tvDetails.name || 'Untitled Show'} - Season ${seasonNum} Episode ${episodeNum}${episodeTitle ? ': ' + episodeTitle : ''}`);
              setMediaDetails(tvDetails);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching media details:', error);
        if (isMounted) {
          memoizedToast({
            title: "Error loading content",
            description: "There was a problem loading the media. Please try again.",
            variant: "destructive"
          });
          memoizedNavigate('/');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };
    
    fetchMediaDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id, season, episode, memoizedNavigate, memoizedToast]);

  useEffect(() => {
    if (!id || !hasInitialized || !mediaDetails) return;

    const mediaId = parseInt(id, 10);
    const seasonNum = season ? parseInt(season, 10) : 1;
    const episodeNum = episode ? parseInt(episode, 10) : 1;

    if (Number.isNaN(mediaId) || (mediaType === 'tv' && (Number.isNaN(seasonNum) || Number.isNaN(episodeNum)))) {
      return;
    }

    const activeSource = videoSources.find((source) => source.key === selectedSource)
      || videoSources.find((source) => source.key === DEFAULT_STREAM_SOURCE)
      || videoSources[0];
    const sourceUrl = getEmbedUrlForSource(
      activeSource.key,
      mediaId,
      mediaType,
      mediaType === 'tv' ? seasonNum : undefined,
      mediaType === 'tv' ? episodeNum : undefined
    );

    if (!sourceUrl) return;

    if (activeSource.key !== selectedSource) {
      setSelectedSource(activeSource.key);
    }

    setEmbedUrl(sourceUrl);
  }, [id, season, episode, hasInitialized, mediaDetails, mediaType, selectedSource, getEmbedUrlForSource]);

  const handleAutoNextToggle = useCallback((enabled: boolean) => {
    setAutoNextEnabled(enabled);
    localStorage.setItem('autoNextEnabled', enabled.toString());
    
    memoizedToast({
      title: enabled ? "Auto-Next Enabled" : "Auto-Next Disabled",
      description: enabled 
        ? "Next episode will play automatically when current one ends." 
        : "Auto-next feature is now disabled.",
      duration: 3000,
    });
  }, [memoizedToast]);

  const handleSourceChange = useCallback((sourceKey: string) => {
    const source = videoSources.find((item) => item.key === sourceKey);
    if (!source) {
      memoizedToast({
        title: 'Invalid server',
        description: 'The selected stream server is not available.',
        variant: 'destructive',
      });
      return;
    }

    if (!id || !mediaDetails) return;

    const mediaId = parseInt(id, 10);
    const seasonNum = season ? parseInt(season, 10) : 1;
    const episodeNum = episode ? parseInt(episode, 10) : 1;
    const sourceUrl = getEmbedUrlForSource(
      sourceKey,
      mediaId,
      mediaType,
      mediaType === 'tv' ? seasonNum : undefined,
      mediaType === 'tv' ? episodeNum : undefined
    );

    if (!sourceUrl) {
      memoizedToast({
        title: 'Server unavailable',
        description: `A stream URL could not be created for ${source.name}.`,
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem(getStreamPreferenceKey(id, mediaType === 'tv'), sourceKey);
    setSelectedSource(sourceKey);
    setEmbedUrl(sourceUrl);
    memoizedToast({
      title: 'Stream server changed',
      description: `Switched to ${source.name}.`,
      duration: 3000,
    });
  }, [memoizedToast, id, mediaDetails, mediaType, season, episode, getEmbedUrlForSource]);

  const goToDetails = useCallback(() => {
    if (id) {
      memoizedNavigate(`/${mediaType}/${id}`);
    }
  }, [id, mediaType, memoizedNavigate]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const goToNextEpisode = useCallback(async () => {
    if (mediaType !== 'tv' || !id || !season || !mediaDetails) return;

    const currentSeasonNum = parseInt(season, 10);
    if (episodes.length === 0 || currentEpisodeIndex >= episodes.length - 1) {
      const tvDetails = mediaDetails as TVDetails;
      const nextSeasonNum = currentSeasonNum + 1;
      const nextSeason = tvDetails.seasons.find(s => s.season_number === nextSeasonNum);
      
      if (nextSeason && nextSeason.episode_count > 0) {
        try {
          const seasonData = await getSeasonDetails(parseInt(id, 10), nextSeasonNum);
          if (seasonData.length > 0) {
            setEpisodes(seasonData);
            setSelectedSeason(nextSeasonNum.toString());
            setCurrentEpisodeIndex(0);
            setVisibleEpisodesCount(10);
            const nextUrl = `/player/tv/${id}/${nextSeasonNum}/${seasonData[0].episode_number}`;
            memoizedNavigate(nextUrl, { replace: false });
            memoizedToast({ 
              title: "Navigation", 
              description: `Playing Season ${nextSeasonNum}, Episode 1: ${seasonData[0].name}` 
            });
          } else {
            memoizedToast({ 
              title: "No More Episodes", 
              description: "This was the last episode of the series.", 
              variant: "default" 
            });
          }
        } catch (error) {
          console.error('Error fetching next season:', error);
          memoizedToast({
            title: "Error",
            description: "Failed to load next season.",
            variant: "destructive"
          });
        }
      } else {
        memoizedToast({ 
          title: "No More Seasons", 
          description: "This was the last season of the series.", 
          variant: "default" 
        });
      }
      return;
    }

    const nextEpisode = episodes[currentEpisodeIndex + 1];
    const nextUrl = `/player/tv/${id}/${season}/${nextEpisode.episode_number}`;
    memoizedNavigate(nextUrl, { replace: false });
    setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    memoizedToast({ title: "Navigation", description: `Playing next episode: ${nextEpisode.name}` });
  }, [mediaType, id, season, episodes, currentEpisodeIndex, mediaDetails, memoizedNavigate, memoizedToast]);

  const goToPreviousEpisode = useCallback(() => {
    if (mediaType !== 'tv' || !id || !season || episodes.length === 0 || currentEpisodeIndex <= 0) return;
    const prevEpisode = episodes[currentEpisodeIndex - 1];
    const prevUrl = `/player/tv/${id}/${season}/${prevEpisode.episode_number}`;
    memoizedNavigate(prevUrl, { replace: false });
    setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    memoizedToast({ title: "Navigation", description: `Playing previous episode: ${prevEpisode.name}` });
  }, [mediaType, id, season, episodes, currentEpisodeIndex, memoizedNavigate, memoizedToast]);
 
  const handleShuffleEpisode = useCallback(() => {
    if (mediaType !== 'tv' || !mediaDetails) {
      memoizedToast({
        title: "Not Available",
        description: "Shuffle is only available for TV shows.",
        variant: "default"
      });
      return;
    }
    
    const tvDetails = mediaDetails as TVDetails;
    if (!tvDetails.seasons || tvDetails.seasons.length === 0) {
      memoizedToast({
        title: "No Seasons Found",
        description: "This show doesn't have any seasons available.",
        variant: "default"
      });
      return;
    }
    
    const regularSeasons = tvDetails.seasons.filter(s => s.season_number > 0);
    
    if (regularSeasons.length === 0) {
      memoizedToast({
        title: "No Regular Seasons",
        description: "No regular seasons available for shuffling.",
        variant: "default"
      });
      return;
    }
    
    const randomSeason = regularSeasons[Math.floor(Math.random() * regularSeasons.length)];
    const seasonNumber = randomSeason.season_number;
    
    const fetchAndPlayRandomEpisode = async () => {
      try {
        const seasonEpisodes = await getSeasonDetails(tvDetails.id, seasonNumber);
        
        if (seasonEpisodes.length === 0) {
          memoizedToast({
            title: "No Episodes",
            description: `Season ${seasonNumber} has no episodes available.`,
            variant: "default"
          });
          return;
        }
        
        const randomEpisode = seasonEpisodes[Math.floor(Math.random() * seasonEpisodes.length)];
        memoizedNavigate(`/player/tv/${tvDetails.id}/${seasonNumber}/${randomEpisode.episode_number}`);
        
        memoizedToast({
          title: "🎲 Shuffle Mode",
          description: `Playing Season ${seasonNumber}, Episode ${randomEpisode.episode_number}: ${randomEpisode.name || 'Untitled'}`,
        });
      } catch (error) {
        console.error('Error fetching season episodes for shuffle:', error);
        memoizedToast({
          title: "Shuffle Failed",
          description: "Could not load random episode. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchAndPlayRandomEpisode();
  }, [mediaType, mediaDetails, memoizedNavigate, memoizedToast]);

  const handlePlayEpisode = useCallback((seasonNumber: number, episodeNumber: number) => {
    if (id) {
      const playUrl = `/player/tv/${id}/${seasonNumber}/${episodeNumber}`;
      memoizedNavigate(playUrl, { replace: false });
      setSelectedSeason(seasonNumber.toString());
      const episodeIndex = episodes.findIndex(ep => ep.episode_number === episodeNumber && ep.season_number === seasonNumber);
      setCurrentEpisodeIndex(episodeIndex !== -1 ? episodeIndex : 0);
      
      if (isMobile) {
        setIsEpisodeMenuOpen(false);
      }
    }
  }, [id, episodes, memoizedNavigate, isMobile]);

  const handleSeasonChange = useCallback(async (value: string) => {
    setSelectedSeason(value);
    if (id) {
      try {
        const seasonNum = parseInt(value, 10);
        const seasonData = await getSeasonDetails(parseInt(id, 10), seasonNum);
        setEpisodes(seasonData);
        setCurrentEpisodeIndex(0);
        setVisibleEpisodesCount(10);
        if (seasonData.length > 0) {
          const seasonUrl = `/player/tv/${id}/${seasonNum}/${seasonData[0].episode_number}`;
          memoizedNavigate(seasonUrl, { replace: false });
          
          if (isMobile) {
            setIsEpisodeMenuOpen(false);
          }
        }
      } catch (error) {
        console.error('Error fetching season details:', error);
        memoizedToast({
          title: "Error",
          description: "Failed to load season episodes.",
          variant: "destructive"
        });
      }
    }
  }, [id, memoizedNavigate, memoizedToast, isMobile]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  }, []);

  // Optimized message handler with throttling
  useEffect(() => {
    const throttledHandler = throttle((event: MessageEvent) => {
      const origins = SOURCE_ORIGINS[selectedSource];
      if (!origins || !origins.includes(event.origin)) return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        
        if (autoNextEnabled && 
            mediaType === 'tv' && 
            episodes.length > 0 && 
            id &&
            Object.keys(SOURCE_ORIGINS).includes(selectedSource)) {
          
          const mediaId = parseInt(id, 10);
          const currentSeasonNum = season ? parseInt(season, 10) : 1;
          const currentEpisodeNum = episode ? parseInt(episode, 10) : 1;
          
          const mediaEntry = Object.values(mediaData).find((entry: any) => 
            entry.id === mediaId || entry.id === mediaId.toString()
          );
          
          if (mediaEntry && (mediaEntry as any).type === "tv") {
            const showProgress = (mediaEntry as any).show_progress || (mediaEntry as any).showProgress;
            
            if (showProgress) {
              const episodeKey = `s${currentSeasonNum}e${currentEpisodeNum}`;
              const episodeProgress = showProgress[episodeKey];
              
              if (episodeProgress) {
                const progress = episodeProgress.progress || episodeProgress;
                if (progress && progress.duration > 0) {
                  const watchedPercentage = (progress.watched / progress.duration) * 100;
                  
                  if (watchedPercentage >= 95) {
                    goToNextEpisode();
                  }
                }
              }
            }
          }
        }
      }

      if (event.data?.type === "PLAYER_EVENT") {
        const { event: eventType } = event.data.data;
        
        if (eventType === "ended" && 
            autoNextEnabled && 
            mediaType === 'tv' && 
            Object.keys(SOURCE_ORIGINS).includes(selectedSource)) {
          goToNextEpisode();
        }
      }
    }, 100);

    window.addEventListener("message", throttledHandler);
    return () => {
      window.removeEventListener("message", throttledHandler);
    };
  }, [mediaType, episodes, id, season, episode, goToNextEpisode, selectedSource, autoNextEnabled]);

    // Optimized video end detection using requestAnimationFrame
  useEffect(() => {
    if (!iframeRef.current || !embedUrl || isLoading || mediaType !== 'tv' || !autoNextEnabled) return;

    const checkVideoEnded = (timestamp: number) => {
      if (timestamp - lastCheckTimeRef.current >= 1000) {
        try {
          const iframeDoc = iframeRef.current?.contentDocument;
          const videoElement = iframeDoc?.querySelector('video');
          if (videoElement && videoElement.ended && episodes.length > 0) {
            goToNextEpisode();
          }
        } catch (error) {
          // Silent fail - cross-origin restrictions
        }
        lastCheckTimeRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(checkVideoEnded);
    };

    animationFrameRef.current = requestAnimationFrame(checkVideoEnded);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [embedUrl, isLoading, mediaType, episodes, goToNextEpisode, autoNextEnabled]);

  // Optimized sandbox error check with debounce
  // Sandbox error checking removed - no longer needed

  // Sandbox logic removed - all sources now have full permissions

  // Memoized episodes to render
  const episodesToRender = useMemo(() => {
    return isMobile ? episodes.slice(0, visibleEpisodesCount) : episodes;
  }, [episodes, isMobile, visibleEpisodesCount]);

    const hasMoreEpisodes = isMobile && visibleEpisodesCount < episodes.length;

  // Render mobile episode menu button
  const renderMobileEpisodeButton = useCallback(() => {
    if (mediaType !== 'tv' || !mediaDetails) return null;
    
    return (
      <button
        onClick={() => setIsEpisodeMenuOpen(prev => !prev)}
        className="fixed right-0 top-1/2 z-40 bg-gradient-to-l from-accent/30 to-accent/10 backdrop-blur-md p-3 rounded-l-xl border border-r-0 border-white/20 shadow-2xl transition-transform active:scale-95"
        style={{ transform: 'translateY(-50%)' }}
      >
        <div className="flex flex-col items-center">
          <ChevronLeft className="h-5 w-5 text-white" />
          <span className="text-xs font-medium text-white mt-1">Episodes</span>
          <span className="text-[10px] text-white/80 mt-0.5">Season {selectedSeason}</span>
        </div>
      </button>
    );
  }, [mediaType, mediaDetails, selectedSeason]);

  // Render mobile episode menu
  const renderMobileEpisodeMenu = useCallback(() => {
    if (mediaType !== 'tv' || !mediaDetails) return null;
    
    return (
      <>
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-200 ${
            isEpisodeMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsEpisodeMenuOpen(false)}
        />
        
        <div 
          className={`fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-gradient-to-b from-background to-background/95 backdrop-blur-xl z-50 border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out ${
            isEpisodeMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white"
                  onClick={() => setIsEpisodeMenuOpen(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Episodes
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Tv className="h-4 w-4 text-accent" />
                <span className="text-sm text-white/80">
                  Season {selectedSeason}
                </span>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <Select 
                value={selectedSeason}
                onValueChange={handleSeasonChange}
              >
                <SelectTrigger className="h-12 bg-black/30 border-white/10 hover:border-white/20 text-white w-full">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <SelectValue placeholder="Select a season" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/95 backdrop-blur-lg border-white/10 text-white">
                  {(mediaDetails as TVDetails).seasons
                    .filter(season => season.season_number > 0)
                    .map(season => (
                      <SelectItem 
                        key={season.id} 
                        value={season.season_number.toString()}
                        className="focus:bg-white/10 hover:bg-white/10 transition-colors cursor-pointer py-3"
                      >
                        <span>Season {season.season_number}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin contain-content">
              <div className="space-y-3">
                {episodesToRender.length > 0 ? (
                  <>
                    {episodesToRender.map((ep) => (
                      <EpisodeCard
                        key={ep.id}
                        episode={ep}
                        isCurrentEpisode={
                          parseInt(season || '0', 10) === ep.season_number && 
                          parseInt(episode || '0', 10) === ep.episode_number
                        }
                        onPlay={handlePlayEpisode}
                        onToggleDescription={toggleEpisodeDescription}
                        isExpanded={expandedEpisodes[ep.id] || false}
                        formatDate={formatDate}
                        isMobile={true}
                      />
                    ))}
                    {hasMoreEpisodes && (
                      <div id="load-more-trigger" className="h-10 flex items-center justify-center">
                        {isLoadingMore && (
                          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                      <Film className="h-8 w-8 text-white/40" />
                    </div>
                    <p className="text-white/70 text-sm">
                      No episodes available for this season.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }, [mediaType, mediaDetails, isEpisodeMenuOpen, selectedSeason, handleSeasonChange, episodesToRender, season, episode, handlePlayEpisode, toggleEpisodeDescription, expandedEpisodes, formatDate, hasMoreEpisodes, isLoadingMore]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-b from-background/95 to-background pointer-events-none" />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <Navbar />
      </nav>

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-center gap-4 py-4 mt-16">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white transition-colors"
            onClick={() => memoizedNavigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-xl md:text-2xl font-semibold truncate flex-1">{title}</h1>

        </div>


        <div className={cn(
          "max-w-7xl mx-auto",
          isMobile ? "flex flex-col" : "flex flex-col md:flex-row gap-8"
        )}>
          <div className="flex-1">
            <div
              ref={playerContainerRef}
              className={cn(
                "relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-black group",
                isFullscreen && "rounded-none w-screen h-screen z-[9999]"
              )}
            >
              {isLoading ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-12 h-12 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              ) : embedUrl ? (
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full"
                  title={title}
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  allow="autoplay; encrypted-media; fullscreen"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <p className="text-white text-lg">Failed to load video. Please try another source.</p>
                </div>
              )}

              {/* Fullscreen Toggle Button */}
              <div className={cn(
                "absolute bottom-4 right-4 z-50 transition-opacity duration-300",
                isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 backdrop-blur-sm border border-white/10"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {mediaType === 'tv' && episodes.length > 1 && (
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  variant="outline"
                  size={isMobile ? "icon" : "lg"}
                  onClick={goToPreviousEpisode}
                  disabled={currentEpisodeIndex <= 0}
                  className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
                >
                  <SkipBack className="h-5 w-5" />
                  {!isMobile && <span className="ml-2">Previous</span>}
                </Button>
                
                <Button
                  variant="outline"
                  size={isMobile ? "icon" : "lg"}
                  onClick={goToNextEpisode}
                  disabled={currentEpisodeIndex >= episodes.length - 1 && !(mediaDetails as TVDetails)?.seasons.find(s => s.season_number === parseInt(season || '0', 10) + 1)}
                  className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
                >
                  {!isMobile && <span className="mr-2">Next</span>}
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <div className="mt-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AutoNextEpisode
                      isEnabled={autoNextEnabled}
                      onToggle={handleAutoNextToggle}
                      currentSource={selectedSource}
                      mediaType={mediaType}
                      currentEpisode={
                        mediaType === 'tv' && season && episode 
                          ? { 
                              season: parseInt(season, 10), 
                              episode: parseInt(episode, 10) 
                            }
                          : undefined
                      }
                      onNextEpisode={goToNextEpisode}
                      onPreviousEpisode={goToPreviousEpisode}
                      hasNextEpisode={
                        mediaType === 'tv' && 
                        (currentEpisodeIndex < episodes.length - 1 || 
                         !!((mediaDetails as TVDetails)?.seasons.find(
                           s => s.season_number === parseInt(season || '0', 10) + 1
                         )))
                      }
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
                      onClick={goToDetails}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Details
                    </Button>
 
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                      onClick={handleShuffleEpisode}
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Shuffle
                    </Button>
                  </div>
                </div>

                <section className="relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-indigo-950/50 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
                  <div className="pointer-events-none absolute -right-14 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/30 bg-cyan-200/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">
                            <Server className="h-3.5 w-3.5" />
                            Stream controls
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight text-white">Choose your stream server</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-cyan-50/75">
                          Use this selectable dropdown to choose or change the stream server at any time.
                        </p>
                      </div>

                      <div className="w-full md:w-1/3 md:min-w-[280px] lg:max-w-md">
                        <div className="mb-2 px-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100/80">Select a stream server</span>
                        </div>

                        <Select value={selectedSource} onValueChange={handleSourceChange}>
                          <SelectTrigger className="h-14 w-full border border-cyan-200/50 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 text-white shadow-lg shadow-cyan-950/40 transition-all duration-300 hover:scale-[1.01] hover:border-white/80 hover:from-cyan-400 hover:via-sky-500 hover:to-blue-500 focus:ring-cyan-200/70">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                                <Wifi className="h-4 w-4 text-white" />
                              </span>
                              <div className="min-w-0 text-left">
                                <SelectValue placeholder="Select a stream server" />
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="border border-cyan-300/30 bg-slate-950/95 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
                            {videoSources.map((source) => (
                              <SelectItem
                                key={source.key}
                                value={source.key}
                                className="group cursor-pointer bg-transparent p-1.5 pl-8 focus:bg-transparent data-[highlighted]:bg-transparent"
                              >
                                <div className="flex w-full min-w-[250px] items-center rounded-lg border border-cyan-300/20 bg-cyan-400/[0.06] px-3 py-2.5 font-medium text-white transition-all duration-150 group-data-[highlighted]:border-cyan-200/70 group-data-[highlighted]:bg-cyan-300/10">
                                  {source.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
                        <AlertCircle className="h-4 w-4 text-violet-200" />
                        Playback tip
                      </div>
                      <p className="pt-1 text-sm leading-relaxed text-white/75">
If movie is not available, try switching servers.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Desktop Episodes Panel */}
          {!isMobile && mediaType === 'tv' && mediaDetails && (
            <div className="w-full md:w-[440px] flex-shrink-0 md:-ml-32 md:translate-x-32">
              <div className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Episodes
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Tv className="h-4 w-4 text-accent" />
                    <span className="text-sm text-white/80">
                      Season {selectedSeason}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Select 
                    value={selectedSeason}
                    onValueChange={handleSeasonChange}
                  >
                    <SelectTrigger className="h-11 bg-black/30 border-white/10 hover:border-white/20 text-white w-full">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <SelectValue placeholder="Select a season" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-lg border-white/10 text-white">
                      {(mediaDetails as TVDetails).seasons
                        .filter(season => season.season_number > 0)
                        .map(season => (
                          <SelectItem 
                            key={season.id} 
                            value={season.season_number.toString()}
                            className="focus:bg-white/10 hover:bg-white/10 transition-colors cursor-pointer py-3"
                          >
                            <span>Season {season.season_number}</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
                  <div 
                    className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin contain-content"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
                    }}
                  >
                    {episodes.length > 0 ? (
                      episodes.map((ep) => (
                        <EpisodeCard
                          key={ep.id}
                          episode={ep}
                          isCurrentEpisode={
                            parseInt(season || '0', 10) === ep.season_number && 
                            parseInt(episode || '0', 10) === ep.episode_number
                          }
                          onPlay={handlePlayEpisode}
                          onToggleDescription={toggleEpisodeDescription}
                          isExpanded={expandedEpisodes[ep.id] || false}
                          formatDate={formatDate}
                          isMobile={false}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                          <Film className="h-8 w-8 text-white/40" />
                        </div>
                        <p className="text-white/70 text-sm">
                          No episodes available for this season.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <Ads />
        </div>
      </div>

      {/* Mobile Episode Menu */}
      {isMobile && renderMobileEpisodeButton()}
      {isMobile && renderMobileEpisodeMenu()}
    </div>
  );
};

export default Player;
