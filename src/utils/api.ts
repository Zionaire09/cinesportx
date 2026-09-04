import axios from 'axios';
import { 
  Media, MovieDetails, TVDetails, Episode, Review, Genre, Company, MovieImagesResponse, CastMember, PersonCreditItem, PersonDetails,
  DownloadV1Response, DownloadV3Response, DownloadV4Response, DownloadV5Response, 
  DownloadV6Response, DownloadV7Response, DownloadV8Response, DownloadV9Response, TVDownloadV1Response, TVDownloadV3Response, 
  TVDownloadV4Response, TVDownloadV5Response, TVDownloadV6Response, TVDownloadV7Response, TVDownloadV8Response 
} from './types';

// Add interface for video response
interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

interface TMDBVideoResponse {
  id: number;
  results: TMDBVideo[];
}

// Create axios instance for TMDB
const BLOCKED_MOVIE_IDS = new Set([1368337, 969681]);

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: '297f1b91919bae59d50ed815f8d2e14c',
    language: 'en-US'
  }
});

interface TMDBMovieResult {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
}

interface TMDBTVResult {
  id: number;
  name: string;
  title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  release_date?: string;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
}

interface TMDBMovieDetailsResult extends TMDBMovieResult {
  runtime: number;
  genres: Genre[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: Company[];
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
      }>;
    }>;
  };
}

interface TMDBTVDetailsResult extends TMDBTVResult {
  episode_run_time: number[];
  genres: Genre[];
  status: string;
  tagline: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
  }>;
  production_companies: Company[];
  content_ratings?: {
    results: Array<{
      iso_3166_1: string;
      rating: string;
    }>;
  };
}

const API_KEY = '297f1b91919bae59d50ed815f8d2e14c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const posterSizes = {
  small: `${IMAGE_BASE_URL}/w185`,
  medium: `${IMAGE_BASE_URL}/w342`,
  large: `${IMAGE_BASE_URL}/w500`,
  original: `${IMAGE_BASE_URL}/original`,
};

export const backdropSizes = {
  small: `${IMAGE_BASE_URL}/w300`,
  medium: `${IMAGE_BASE_URL}/w780`,
  large: `${IMAGE_BASE_URL}/w1280`,
  original: `${IMAGE_BASE_URL}/original`,
};

export const videoSources = [
{
    key: 'vidsrc-mov',
    name: '01 Armageddon',
    getMovieUrl: (id: number) => `https://vidsrc.mov/embed/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidsrc.mov/embed/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidlink',
    name: '02 Supernova',
    getMovieUrl: (id: number) => `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true&title=true`,
  },
{
    key: 'vidsrc-wtf-1',
    name: '03 Pringle',
    getMovieUrl: (id: number) => `https://www.vidsrc.wtf/api/1/movie?id=${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://www.vidsrc.wtf/api/1/tv?id=${id}&s=${season}&e=${episode}`,
    sandbox: 'allow-scripts allow-same-origin'
  },
{
    key: 'peachify',
    name: '04 Rabbi',
    getMovieUrl: (id: number) => `https://peachify.pro/embed/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://peachify.pro/embed/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidfast',
    name: '05 Ember',
    getMovieUrl: (id: number) => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`,
  },
{
    key: 'vidcore',
    name: '06 Atlas',
    getMovieUrl: (id: number) => `https://vidcore.net/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidcore.net/tv/${id}/${season}/${episode}`,
  },
{
    key: 'smashystream',
    name: '07 Pulse',
    getMovieUrl: (id: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`,
  },
{
    key: 'vidup',
    name: '08 Swift',
    getMovieUrl: (id: number) => `https://vidup.to/movie/${id}?autoPlay=true`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidup.to/tv/${id}/${season}/${episode}?autoPlay=true`,
  },
{
    key: '111movies',
    name: '09 Prism',
    getMovieUrl: (id: number) => `https://111movies.com/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://111movies.com/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidsrc-me',
    name: '10 Echo',
    getMovieUrl: (id: number) => `https://vidsrcme.ru/embed/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidsrcme.ru/embed/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidzee',
    name: '11 Flux',
    getMovieUrl: (id: number) => `https://player.vidzee.wtf/embed/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://player.vidzee.wtf/embed/tv/${id}/${season}/${episode}`,
  },
{
    key: 'videasy',
    name: '12 Aura',
    getMovieUrl: (id: number) => `https://player.videasy.net/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://player.videasy.net/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidnest',
    name: '13 Haven',
    getMovieUrl: (id: number) => `https://vidnest.fun/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidnest.fun/tv/${id}/${season}/${episode}`,
  },
{
    key: 'vidrock',
    name: '14 Forge',
    getMovieUrl: (id: number) => `https://vidrock.ru/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidrock.ru/tv/${id}/${season}/${episode}`,
  },
{
    key: '2embed',
    name: '15 Link',
    getMovieUrl: (id: number) => `https://www.2embed.cc/embed/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
{
    key: 'multiembed',
    name: '16 Loop',
    getMovieUrl: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTVUrl: (id: number, season: number, episode: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
{
    key: 'primesrc',
    name: '17 Prime',
    getMovieUrl: (id: number) => `https://primesrc.me/embed/movie?tmdb=${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://primesrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
{
    key: 'vidlux',
    name: '18 Nova',
    getMovieUrl: (id: number) => `https://vidlux.xyz/embed/movie/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://vidlux.xyz/embed/tv/${id}/${season}/${episode}`,
  },
{
    key: 'streamxtv',
    name: '19 Zenith',
    getMovieUrl: (id: number) => `https://embed.streamxtv.tech/embed/${id}`,
    getTVUrl: (id: number, season: number, episode: number) => `https://embed.streamxtv.tech/embed/${id}/${season}/${episode}`,
  }
];

// Fetch reviews for a movie or TV show based on media type
export const getReviews = async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<Review[]> => {
  try {
    if (mediaType === 'movie') {
      return await getMovieReviews(mediaId);
    } else if (mediaType === 'tv') {
      return await getTVReviews(mediaId);
    } else {
      throw new Error('Invalid media type. Must be "movie" or "tv".');
    }
  } catch (error) {
    console.error(`Error fetching reviews for ${mediaType} ID ${mediaId}:`, error);
    throw error;
  }
};

// Fetch trending media (movies and TV shows)
export const getTrending = async (timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: (TMDBMovieResult | TMDBTVResult)[] }>(
      `/trending/all/${timeWindow}`,
      {
        params: { page },
      }
    );
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: (item as TMDBMovieResult).title,
      name: (item as TMDBTVResult).name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: (item as TMDBMovieResult).release_date,
      first_air_date: (item as TMDBTVResult).first_air_date,
      media_type: item.media_type || ('title' in item ? 'movie' : 'tv'),
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error(`Error fetching trending media for ${timeWindow}:`, error);
    throw error;
  }
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  if (BLOCKED_MOVIE_IDS.has(movieId)) {
    throw new Error('Movie unavailable due to copyright');
  }
  try {
    const [detailsResponse, imagesResponse] = await Promise.all([
      tmdb.get<TMDBMovieDetailsResult>(`/movie/${movieId}`),
      tmdb.get(`/movie/${movieId}/images`),
    ]);
    const data = detailsResponse.data;

    const certification = data.release_dates?.results.find(
      (r) => r.iso_3166_1 === 'US'
    )?.release_dates[0]?.certification;

    const logos = imagesResponse.data.logos || [];
    const logo_path = logos.find((l: any) => l.iso_639_1 === 'en')?.file_path || logos[0]?.file_path || null;

    return {
      id: data.id,
      title: data.title,
      poster_path: data.poster_path || '',
      backdrop_path: data.backdrop_path || '',
      overview: data.overview,
      vote_average: data.vote_average,
      release_date: data.release_date,
      media_type: 'movie',
      genre_ids: data.genre_ids || [],
      runtime: data.runtime,
      genres: data.genres,
      status: data.status,
      tagline: data.tagline,
      budget: data.budget,
      revenue: data.revenue,
      production_companies: data.production_companies,
      certification,
      logo_path,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getTVDetails = async (tvId: number): Promise<TVDetails> => {
  try {
    const [detailsResponse, imagesResponse] = await Promise.all([
      tmdb.get<TMDBTVDetailsResult>(`/tv/${tvId}`),
      tmdb.get(`/tv/${tvId}/images`),
    ]);
    const data = detailsResponse.data;

    const certification = data.content_ratings?.results.find(
      (r) => r.iso_3166_1 === 'US'
    )?.rating;

    const logos = imagesResponse.data.logos || [];
    const logo_path = logos.find((l: any) => l.iso_639_1 === 'en')?.file_path || logos[0]?.file_path || null;

    return {
      id: data.id,
      name: data.name,
      poster_path: data.poster_path || '',
      backdrop_path: data.backdrop_path || '',
      overview: data.overview,
      vote_average: data.vote_average,
      first_air_date: data.first_air_date,
      media_type: 'tv',
      genre_ids: data.genre_ids || [],
      episode_run_time: data.episode_run_time,
      genres: data.genres,
      status: data.status,
      tagline: data.tagline,
      number_of_episodes: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
      seasons: data.seasons.map((s) => ({
        id: s.id,
        name: s.name,
        overview: s.overview,
        poster_path: s.poster_path || '',
        season_number: s.season_number,
        episode_count: s.episode_count,
      })),
      production_companies: data.production_companies,
      certification,
      logo_path,
    };
  } catch (error) {
    console.error('Error fetching TV details:', error);
    throw error;
  }
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number): Promise<Episode[]> => {
  try {
    const response = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    const data = response.data;
    return data.episodes.map((ep: any) => ({
      id: ep.id,
      name: ep.name,
      overview: ep.overview,
      still_path: ep.still_path || '',
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      vote_average: ep.vote_average,
      air_date: ep.air_date,
    }));
  } catch (error) {
    console.error(`Error fetching season ${seasonNumber} details for TV ID ${tvId}:`, error);
    throw error;
  }
};

export const getMovieImages = async (movieId: number): Promise<MovieImagesResponse> => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/images`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie images:', error);
    throw error;
  }
};

export const getTVImages = async (tvId: number): Promise<MovieImagesResponse> => {
  try {
    const response = await tmdb.get(`/tv/${tvId}/images`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV images:', error);
    throw error;
  }
};

export const getMovieReviews = async (movieId: number): Promise<Review[]> => {
  try {
    const response = await tmdb.get<{ results: any[] }>(`/movie/${movieId}/reviews`);
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((r) => ({
      id: r.id,
      author: r.author,
      content: r.content,
      created_at: r.created_at,
      author_details: {
        rating: r.author_details.rating,
        avatar_path: r.author_details.avatar_path,
      },
    }));
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};

export const getTVReviews = async (tvId: number): Promise<Review[]> => {
  try {
    const response = await tmdb.get<{ results: any[] }>(`/tv/${tvId}/reviews`);
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((r) => ({
      id: r.id,
      author: r.author,
      content: r.content,
      created_at: r.created_at,
      author_details: {
        rating: r.author_details.rating,
        avatar_path: r.author_details.avatar_path,
      },
    }));
  } catch (error) {
    console.error('Error fetching TV reviews:', error);
    throw error;
  }
};

export const getPopularMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>(`/movie/popular`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type || 'movie',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getPopularTVShows = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/tv/popular`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      name: item.name,
      title: item.title,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      first_air_date: item.first_air_date,
      release_date: item.release_date,
      media_type: item.media_type || 'tv',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
};

export const getTopRatedMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>(`/movie/top_rated`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type || 'movie',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching top-rated movies:', error);
    throw error;
  }
};

export const getTopRatedTVShows = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/tv/top_rated`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      name: item.name,
      title: item.title,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      first_air_date: item.first_air_date,
      release_date: item.release_date,
      media_type: item.media_type || 'tv',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching top-rated TV shows:', error);
    throw error;
  }
};

export const getUpcomingMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>(`/movie/upcoming`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type || 'movie',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const getActionMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>(`/discover/movie`, {
      params: {
        page,
        with_genres: '28', // Action genre ID
      },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type || 'movie',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching action movies:', error);
    throw error;
  }
};

export const getKoreanDramas = async (
  page: number = 1,
  sortBy: 'popularity.desc' | 'vote_average.desc' = 'popularity.desc'
): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>('/discover/tv', {
      params: {
        page,
        sort_by: sortBy,
        with_origin_country: 'KR',
        with_genres: '18',
      },
    });

    return response.data.results
      .filter(item => !BLOCKED_MOVIE_IDS.has(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        title: item.title,
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        overview: item.overview,
        vote_average: item.vote_average,
        first_air_date: item.first_air_date,
        release_date: item.release_date,
        media_type: 'tv' as const,
        genre_ids: item.genre_ids || [],
      }));
  } catch (error) {
    console.error('Error fetching Korean dramas:', error);
    throw error;
  }
};

export const getNewKoreanEpisodes = async (page: number = 1): Promise<Media[]> => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 90);

    const response = await tmdb.get<{ results: TMDBTVResult[] }>('/discover/tv', {
      params: {
        page,
        sort_by: 'first_air_date.desc',
        with_origin_country: 'KR',
        with_genres: '18',
        'air_date.gte': startDate.toISOString().slice(0, 10),
        'air_date.lte': today.toISOString().slice(0, 10),
      },
    });

    return response.data.results
      .filter(item => !BLOCKED_MOVIE_IDS.has(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        title: item.title,
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        overview: item.overview,
        vote_average: item.vote_average,
        first_air_date: item.first_air_date,
        release_date: item.release_date,
        media_type: 'tv' as const,
        genre_ids: item.genre_ids || [],
      }));
  } catch (error) {
    console.error('Error fetching newly released Korean episodes:', error);
    throw error;
  }
};

export const getTrendingKoreanMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>('/discover/movie', {
      params: {
        page,
        sort_by: 'popularity.desc',
        with_origin_country: 'KR',
      },
    });

    return response.data.results
      .filter(item => !BLOCKED_MOVIE_IDS.has(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        media_type: 'movie' as const,
        genre_ids: item.genre_ids || [],
      }));
  } catch (error) {
    console.error('Error fetching trending Korean movies:', error);
    throw error;
  }
};

export const getNewKoreanMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);

    const response = await tmdb.get<{ results: TMDBMovieResult[] }>('/discover/movie', {
      params: {
        page,
        sort_by: 'primary_release_date.desc',
        with_origin_country: 'KR',
        'primary_release_date.gte': startDate.toISOString().slice(0, 10),
        'primary_release_date.lte': today.toISOString().slice(0, 10),
      },
    });

    return response.data.results
      .filter(item => !BLOCKED_MOVIE_IDS.has(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        media_type: 'movie' as const,
        genre_ids: item.genre_ids || [],
      }));
  } catch (error) {
    console.error('Error fetching new Korean movies:', error);
    throw error;
  }
};

export const getComedySeries = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/discover/tv`, {
      params: {
        page,
        with_genres: '35', // Comedy genre ID
      },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      name: item.name,
      title: item.title,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      first_air_date: item.first_air_date,
      release_date: item.release_date,
      media_type: item.media_type || 'tv',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error fetching comedy series:', error);
    throw error;
  }
};

export const getMovieRecommendations = async (movieId: number, page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBMovieResult[] }>(`/movie/${movieId}/recommendations`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.media_type || 'movie',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error(`Error fetching recommendations for movie ID ${movieId}:`, error);
    throw error;
  }
};

export const getTVRecommendations = async (tvId: number, page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/tv/${tvId}/recommendations`, {
      params: { page },
    });
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      name: item.name,
      title: item.title,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      first_air_date: item.first_air_date,
      release_date: item.release_date,
      media_type: item.media_type || 'tv',
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error(`Error fetching recommendations for TV ID ${tvId}:`, error);
    throw error;
  }
};

export const searchMedia = async (query: string, page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get<{ results: (TMDBMovieResult | TMDBTVResult)[] }>(
      `/search/multi`,
      {
        params: { query, page },
      }
    );
    return response.data.results.filter(item => !BLOCKED_MOVIE_IDS.has(item.id)).map((item) => ({
      id: item.id,
      title: (item as TMDBMovieResult).title,
      name: (item as TMDBTVResult).name,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: (item as TMDBMovieResult).release_date,
      first_air_date: (item as TMDBTVResult).first_air_date,
      media_type: item.media_type || ('title' in item ? 'movie' : 'tv'),
      genre_ids: item.genre_ids,
    }));
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

export const getMovieTrailer = async (movieId: number): Promise<string | null> => {
  try {
    const response = await tmdb.get<TMDBVideoResponse>(`/movie/${movieId}/videos`);
    const videos = response.data.results;
    
    const trailer = videos.find(
      (video) => 
        video.type === "Trailer" && 
        video.site === "YouTube" &&
        video.official === true
    ) || 
    videos.find(
      (video) => 
        video.type === "Trailer" && 
        video.site === "YouTube"
    ) ||
    videos.find((video) => video.site === "YouTube");

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return null;
  }
};

export const getTVTrailer = async (tvId: number): Promise<string | null> => {
  try {
    const response = await tmdb.get<TMDBVideoResponse>(`/tv/${tvId}/videos`);
    const videos = response.data.results;
    
    const trailer = videos.find(
      (video) => 
        video.type === "Trailer" && 
        video.site === "YouTube" &&
        video.official === true
    ) || 
    videos.find(
      (video) => 
        video.type === "Trailer" && 
        video.site === "YouTube"
    ) ||
    videos.find((video) => video.site === "YouTube");

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching TV trailer:', error);
    return null;
  }
};
// Movie Download API functions
export const getMovieDownloadV1 = async (tmdbId: string): Promise<DownloadV1Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v1/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V1 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V1 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

export const getMovieDownloadV3 = async (tmdbId: string): Promise<DownloadV3Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v3/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V3 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V3 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

export const getMovieDownloadV4 = async (tmdbId: string): Promise<DownloadV4Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v4/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V4 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V4 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

export const getMovieDownloadV5 = async (tmdbId: string): Promise<DownloadV5Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v5/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V5 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V5 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

export const getMovieDownloadV6 = async (tmdbId: string): Promise<DownloadV6Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v6/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V6 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V6 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};
export const getMovieDownloadV7 = async (tmdbId: string): Promise<DownloadV7Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v7/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V7 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V7 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};
export const getMovieDownloadV8 = async (tmdbId: string): Promise<DownloadV8Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v8/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V8 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V8 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};
export const getMovieDownloadV9 = async (tmdbId: string): Promise<DownloadV9Response[] | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/movie/v9/${tmdbId}`);
    if (!response.ok) {
      console.error(`Error fetching V9 download for TMDB ID ${tmdbId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V9 download for TMDB ID ${tmdbId}:`, error);
    return null;
  }
};

// TV Download API functions
export const getTVDownloadV1 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV1Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v1/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V1 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V1 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};

export const getTVDownloadV3 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV3Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v3/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V3 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V3 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};

export const getTVDownloadV4 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV4Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v4/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V4 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V4 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};

export const getTVDownloadV5 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV5Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v5/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V5 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V5 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};

export const getTVDownloadV6 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV6Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v6/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V6 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V6 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};
export const getTVDownloadV7 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV7Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v7/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V7 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V7 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};
export const getTVDownloadV8 = async (tmdbId: string, season: number, episode: number): Promise<TVDownloadV8Response | null> => {
  try {
    const response = await fetch(`https://dl.vidzee.wtf/download/tv/v8/${tmdbId}/${season}/${episode}`);
    if (!response.ok) {
      console.error(`Error fetching V8 TV download for TMDB ID ${tmdbId}, S${season} E${episode}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching V8 TV download for TMDB ID ${tmdbId}, S${season} E${episode}:`, error);
    return null;
  }
};


export const getMovieCredits = async (movieId: number): Promise<CastMember[]> => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/credits`);
    return (response.data.cast || []).slice(0, 20).map((member: any) => ({
      id: member.id,
      name: member.name,
      character: member.character || '',
      profile_path: member.profile_path || null,
      order: member.order ?? 0,
    }));
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    return [];
  }
};

export const getTVCredits = async (tvId: number): Promise<CastMember[]> => {
  try {
    const response = await tmdb.get(`/tv/${tvId}/aggregate_credits`);
    return (response.data.cast || []).slice(0, 20).map((member: any) => ({
      id: member.id,
      name: member.name,
      character: member.roles?.[0]?.character || '',
      profile_path: member.profile_path || null,
      order: member.order ?? 0,
    }));
  } catch (error) {
    console.error('Error fetching TV credits:', error);
    return [];
  }
};

export const getPersonCombinedCredits = async (personId: number): Promise<PersonCreditItem[]> => {
  try {
    const response = await tmdb.get(`/person/${personId}/combined_credits`);
    return (response.data.cast || []).map((credit: any) => ({
      id: credit.id,
      title: credit.title,
      name: credit.name,
      poster_path: credit.poster_path || '',
      backdrop_path: credit.backdrop_path || '',
      overview: credit.overview || '',
      vote_average: credit.vote_average || 0,
      release_date: credit.release_date,
      first_air_date: credit.first_air_date,
      media_type: credit.media_type === 'tv' ? 'tv' : 'movie',
      genre_ids: credit.genre_ids || [],
      character: credit.character,
    }));
  } catch (error) {
    console.error('Error fetching person credits:', error);
    return [];
  }
};


export const getPersonDetails = async (personId: number): Promise<PersonDetails | null> => {
  try {
    const response = await tmdb.get(`/person/${personId}`);
    return {
      id: response.data.id,
      name: response.data.name,
      profile_path: response.data.profile_path || null,
    };
  } catch (error) {
    console.error('Error fetching person details:', error);
    return null;
  }
};


export const getNowPlayingMovies = async (): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/movie/now_playing');
    return (response.data.results || []).filter((item: any) => !BLOCKED_MOVIE_IDS.has(item.id)).map((item: any) => ({
      id: item.id, title: item.title, poster_path: item.poster_path || '', backdrop_path: item.backdrop_path || '', overview: item.overview || '', vote_average: item.vote_average || 0, release_date: item.release_date, media_type: 'movie' as const, genre_ids: item.genre_ids || [],
    }));
  } catch (error) { console.error('Error fetching now-playing movies:', error); return []; }
};

export const getAiringTodayTV = async (): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/tv/airing_today');
    return (response.data.results || []).map((item: any) => ({
      id: item.id, name: item.name, poster_path: item.poster_path || '', backdrop_path: item.backdrop_path || '', overview: item.overview || '', vote_average: item.vote_average || 0, first_air_date: item.first_air_date, media_type: 'tv' as const, genre_ids: item.genre_ids || [],
    }));
  } catch (error) { console.error('Error fetching airing-today TV:', error); return []; }
};
