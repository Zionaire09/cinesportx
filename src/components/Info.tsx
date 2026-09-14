import { Link } from 'react-router-dom';
import { getMovieCredits, getTVCredits, posterSizes } from '@/utils/api';
import { CastMember } from '@/utils/types';
import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import SportsBanner from '@/components/SportsBanner';

interface InfoProps {
  mediaId: number;
  mediaType?: 'movie' | 'tv';
}

const Info = ({ mediaId, mediaType = 'movie' }: InfoProps) => {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadCast = async () => {
      setIsLoading(true);
      const credits = mediaType === 'movie'
        ? await getMovieCredits(mediaId)
        : await getTVCredits(mediaId);
      if (!cancelled) {
        setCast(credits);
        setIsLoading(false);
      }
    };
    loadCast();
    return () => { cancelled = true; };
  }, [mediaId, mediaType]);

  const banner = <SportsBanner className="mb-0" />;

  if (isLoading) {
    return (
      <>
        {banner}
        <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex-none w-28 animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-white/10" />
              <div className="h-3 mt-2 rounded bg-white/10" />
            </div>
          ))}
        </div>
        </section>
      </>
    );
  }

  if (!cast.length) return null;

  return (
    <>
      {banner}
      <section className="mt-8" aria-labelledby="cast-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="cast-heading" className="text-xl font-semibold text-white">Cast</h2>
        <span className="text-sm text-white/50">{cast.length} listed</span>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {cast.map((member) => (
          <Link
            key={`${member.id}-${member.order}`}
            to={`/person/${member.id}`}
            className="group flex-none w-28 text-center"
            aria-label={`View movies featuring ${member.name}`}
          >
            <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/10 shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-accent">
              {member.profile_path ? (
                <img
                  src={`${posterSizes.medium}${member.profile_path}`}
                  alt={member.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/40">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-white line-clamp-2">{member.name}</p>
            {member.character && (
              <p className="mt-1 text-xs text-white/50 line-clamp-2">{member.character}</p>
            )}
          </Link>
        ))}
      </div>
      </section>
    </>
  );
};

export default Info;
