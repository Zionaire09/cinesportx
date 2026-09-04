export type MediaFilterType = 'all' | 'movie' | 'tv';
export type GenreOption = { id: string; label: string };

export const mediaTypes: Array<{ value: MediaFilterType; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'movie', label: 'Movies' }, { value: 'tv', label: 'TV Shows' },
];

export const movieGenres: GenreOption[] = [
  { id: 'all', label: 'All Categories' }, { id: '28', label: 'Action' }, { id: '12', label: 'Adventure' }, { id: '16', label: 'Animation' }, { id: '35', label: 'Comedy' }, { id: '80', label: 'Crime' }, { id: '99', label: 'Documentary' }, { id: '18', label: 'Drama' }, { id: '10751', label: 'Family' }, { id: '14', label: 'Fantasy' }, { id: '36', label: 'History' }, { id: '27', label: 'Horror' }, { id: '10402', label: 'Music' }, { id: '9648', label: 'Mystery' }, { id: '10749', label: 'Romance' }, { id: '878', label: 'Science Fiction' }, { id: '53', label: 'Thriller' }, { id: '10752', label: 'War' }, { id: '37', label: 'Western' }, { id: '10770', label: 'TV Movie' },
];

export const tvGenres: GenreOption[] = [
  { id: 'all', label: 'All Categories' }, { id: '10759', label: 'Action & Adventure' }, { id: '16', label: 'Animation' }, { id: '35', label: 'Comedy' }, { id: '80', label: 'Crime' }, { id: '99', label: 'Documentary' }, { id: '18', label: 'Drama' }, { id: '10751', label: 'Family' }, { id: '10762', label: 'Kids' }, { id: '9648', label: 'Mystery' }, { id: '10764', label: 'Reality' }, { id: '10765', label: 'Sci-Fi & Fantasy' }, { id: '10766', label: 'Soap' }, { id: '10768', label: 'War & Politics' }, { id: '37', label: 'Western' },
];

export const genresForType = (type: MediaFilterType) => type === 'tv' ? tvGenres : movieGenres;

export const matchesMediaFilters = (media: { media_type: 'movie' | 'tv'; genre_ids?: number[] }, type: MediaFilterType, genre: string) => {
  if (type !== 'all' && media.media_type !== type) return false;
  if (genre === 'all') return true;
  // All/Movies use the movie taxonomy; TV uses TMDB's TV taxonomy.
  return media.genre_ids?.includes(Number(genre)) ?? false;
};
