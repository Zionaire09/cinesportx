import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Film, Tv } from 'lucide-react';
import { getPersonCombinedCredits, getPersonDetails, posterSizes } from '@/utils/api';
import { PersonCreditItem, PersonDetails } from '@/utils/types';
import Navbar from '@/components/Navbar';
import MediaGrid from '@/components/MediaGrid';
import { Button } from '@/components/ui/button';
import Ads from '@/components/Ads';

const PersonFilmography = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<PersonCreditItem[]>([]);
  const [activeType, setActiveType] = useState<'movie' | 'tv'>('movie');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const personId = Number(id);
    if (!Number.isInteger(personId)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([getPersonDetails(personId), getPersonCombinedCredits(personId)])
      .then(([personData, creditData]) => {
        if (cancelled) return;
        setPerson(personData);
        setCredits(creditData);
        if (!creditData.some((credit) => credit.media_type === 'movie')) setActiveType('tv');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const visibleCredits = useMemo(() => {
    const unique = new Map<number, PersonCreditItem>();
    credits
      .filter((credit) => credit.media_type === activeType && credit.poster_path)
      .sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        return dateB.localeCompare(dateA) || b.vote_average - a.vote_average;
      })
      .forEach((credit) => unique.set(credit.id, credit));
    return Array.from(unique.values());
  }, [credits, activeType]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading filmography...</div>;
  if (!person) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-white"><h1 className="text-2xl">Cast member not found</h1><Button onClick={() => navigate(-1)}>Go back</Button></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <button onClick={() => navigate(-1)} className="relative z-10 mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>
        <div className="flex items-center gap-5 mb-8">
          {person.profile_path && <img src={`${posterSizes.medium}${person.profile_path}`} alt={person.name} className="h-24 w-24 rounded-full object-cover" />}
          <div><p className="text-sm uppercase tracking-wider text-accent">Cast member</p><h1 className="text-3xl font-bold text-white">{person.name}</h1><p className="text-white/60 mt-1">Movies and shows featuring this cast member</p></div>
        </div>
        <div className="flex gap-2 border-b border-white/10 mb-6">
          <button onClick={() => setActiveType('movie')} className={`inline-flex items-center gap-2 px-4 py-3 font-medium ${activeType === 'movie' ? 'text-white border-b-2 border-accent' : 'text-white/60'}`}><Film className="h-4 w-4" /> Movies</button>
          <button onClick={() => setActiveType('tv')} className={`inline-flex items-center gap-2 px-4 py-3 font-medium ${activeType === 'tv' ? 'text-white border-b-2 border-accent' : 'text-white/60'}`}><Tv className="h-4 w-4" /> TV Shows</button>
        </div>
        {visibleCredits.length ? <MediaGrid media={visibleCredits} /> : <p className="py-12 text-center text-white/60">No {activeType === 'movie' ? 'movies' : 'TV shows'} found.</p>}
      </main>
      <Ads />
    </div>
  );
};

export default PersonFilmography;
