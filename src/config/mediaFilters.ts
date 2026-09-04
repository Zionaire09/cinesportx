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

const genreIdsByCategory: Record<string, number[]> = {
  'action-adventure': [28, 12, 10759],
  '16': [16],
  '35': [35],
  '80': [80],
  '18': [18],
  '14': [14, 10765],
  // TMDB has no literal TV Horror/Romance/Thriller genres; these are the
  // closest TV categories used for those themes.
  '27': [27, 9648, 10765],
  '10749': [10749, 18, 10766],
  '878': [878, 10765],
  '53': [53, 9648, 80, 10765],
};

export const matchesMediaFilters = (media: { media_type: 'movie' | 'tv'; genre_ids?: number[] }, type: MediaFilterType, genre: string) => {
  const matchesGenre = genre === 'all'
    || Boolean(genreIdsByCategory[genre]?.some((id) => media.genre_ids?.includes(id)));
  return (type === 'all' || media.media_type === type) && matchesGenre;
};
