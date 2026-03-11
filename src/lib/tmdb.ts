const API_KEY = "e8d22c755d73bec02627838a3f4a7909";
const BASE = "https://api.themoviedb.org/3";

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "pt-BR");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

export function searchMulti(query: string, page = 1) {
  return get<TMDBSearchResult>("/search/multi", { query, page: String(page) });
}

export function getMovie(id: number) {
  return get<TMDBMovie>(`/movie/${id}`, { append_to_response: "videos,watch/providers,credits" });
}

export function getTVShow(id: number) {
  return get<TMDBTVShow>(`/tv/${id}`, { append_to_response: "videos,watch/providers,credits" });
}

export function getTVSeason(tvId: number, seasonNumber: number) {
  return get<TMDBSeason>(`/tv/${tvId}/season/${seasonNumber}`);
}

export function getTrending() {
  return get<TMDBSearchResult>("/trending/all/week");
}

export function imgUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Types
export interface TMDBSearchResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBSearchItem[];
}

export interface TMDBSearchItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  videos: { results: TMDBVideo[] };
  "watch/providers": { results: { BR?: TMDBProviders } };
  credits: { cast: TMDBCast[] };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TMDBSeasonSummary[];
  next_episode_to_air: { name: string; episode_number: number; season_number: number; air_date: string } | null;
  genres: { id: number; name: string }[];
  videos: { results: TMDBVideo[] };
  "watch/providers": { results: { BR?: TMDBProviders } };
  credits: { cast: TMDBCast[] };
}

export interface TMDBSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface TMDBProviders {
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
}

export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
