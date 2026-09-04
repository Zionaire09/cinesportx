export type MediaFilterType = 'all' | 'movie' | 'tv';

export const mediaTypes: Array<{ value: MediaFilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

export const mediaGenres = [
  { id: 'all', label: 'All Categories' },
  { id: 'action-adventure', label: 'Action & Adventure' },
  { id: '16', label: 'Animation' },
  { id: '35', label: 'Comedy' },
  { id: '80', label: 'Crime' },
  { id: '18', label: 'Drama' },
  { id: '14', label: 'Fantasy' },
  { id: '27', label: 'Horror' },
  { id: '10749', label: 'Romance' },
  { id: '878', label: 'Science Fiction' },
  { id: '53', label: 'Thriller' },
];

export const matchesMediaFilters = (media: { media_type: 'movie' | 'tv'; genre_ids?: number[] }, type: MediaFilterType, genre: string) => {
  const matchesGenre = genre === 'all'
    || (genre === 'action-adventure' && Boolean(media.genre_ids?.some((id) => id === 28 || id === 12)))
    || media.genre_ids?.includes(Number(genre));
  return (type === 'all' || media.media_type === type) && matchesGenre;
};
