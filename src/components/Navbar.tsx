import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { ArrowRight, ExternalLink, Film, Home, Keyboard, Menu, Search, Sparkles, TrendingUp, Tv, Volleyball, X } from 'lucide-react';
import { searchMedia } from '@/utils/api';
import { Media } from '@/utils/types';
import { DiscordIcon } from '@/components/DiscordButton';

const Logo = '/logo2.png';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  external?: boolean;
}

const navItems: NavItem[] = [
  { title: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
  { title: 'Trending', path: '/trending', icon: <TrendingUp className="h-4 w-4" /> },
  { title: 'New', path: '/new', icon: <Sparkles className="h-4 w-4" /> },
  { title: 'Movies', path: '/movies', icon: <Film className="h-4 w-4" /> },
  { title: 'TV Shows', path: '/tv', icon: <Tv className="h-4 w-4" /> },
  { title: 'Sports', path: '/sports', icon: <Volleyball className="h-4 w-4" /> },
  { title: 'AI Shorts', path: 'https://ai-shorts.live', icon: <Sparkles className="h-4 w-4" />, external: true },
  { title: 'Anime', path: 'https://animeow.live', icon: <ExternalLink className="h-4 w-4" />, external: true },
  { title: 'Discord', path: 'https://discord.gg/Ge7Pe5Nmd', icon: <DiscordIcon className="h-4 w-4" />, external: true },
];

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Media[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSuggestionsRef = useRef<HTMLDivElement>(null);
  const desktopSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenKeyboardHint');
    if (!hasSeenHint) {
      const timer = window.setTimeout(() => {
        setShowKeyboardHint(true);
        localStorage.setItem('hasSeenKeyboardHint', 'true');
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const activeSearchInput = window.matchMedia('(min-width: 1024px)').matches
          ? desktopSearchInputRef.current
          : mobileSearchInputRef.current;
        activeSearchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSearch = [
        mobileSearchInputRef.current,
        desktopSearchInputRef.current,
        mobileSuggestionsRef.current,
        desktopSuggestionsRef.current,
      ].some((element) => element?.contains(target));

      if (!clickedInsideSearch) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await searchMedia(query);
        setSearchSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timer = window.setTimeout(fetchSuggestions, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const handleSuggestionClick = (item: Media) => {
    navigate(`/${item.media_type}/${item.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const getPosterUrl = (item: Media) => (
    item.poster_path
      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
      : 'https://via.placeholder.com/92x138/1a1a1a/666666?text=No+Image'
  );

  const SearchSuggestions = ({
    containerRef,
  }: {
    containerRef: React.RefObject<HTMLDivElement | null>;
  }) => {
    if (!showSuggestions || searchSuggestions.length === 0) return null;

    return (
      <div
        ref={containerRef}
        className="absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl z-50"
      >
        <div className="max-h-96 overflow-y-auto">
          {searchSuggestions.map((item) => (
            <button
              key={`${item.media_type}-${item.id}`}
              type="button"
              onClick={() => handleSuggestionClick(item)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
            >
              <img
                src={getPosterUrl(item)}
                alt={item.title || item.name}
                className="mr-3 h-14 w-10 rounded object-cover"
                loading="lazy"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.title || item.name}</span>
                <span className="mt-1 block truncate text-xs text-white/60">
                  {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-accent transition-colors hover:bg-white/10"
          >
            <span>View all results for &quot;{searchQuery}&quot;</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const isMovieRoute = ['/movie', '/movies'].includes(location.pathname) || location.pathname.startsWith('/movie/') || location.pathname.startsWith('/player/movie/');
        const isTVRoute = location.pathname === '/tv' || location.pathname.startsWith('/tv/') || location.pathname.startsWith('/player/tv/');
        const isActive = !item.external && (
          (item.title === 'Movies' && isMovieRoute) ||
          (item.title === 'TV Shows' && isTVRoute) ||
          (item.title === 'Sports' && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))) ||
          (item.title !== 'Movies' && item.title !== 'TV Shows' && item.title !== 'Sports' && location.pathname === item.path)
        );
        const isSports = item.title === 'Sports';
        const desktopClasses = `inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
          isSports && isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500 hover:text-white'
            : isSports
              ? 'border border-accent/40 bg-accent/10 text-accent hover:border-accent/70 hover:bg-accent/20 hover:text-white'
            : isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500'
              : item.external
                ? 'border border-accent/40 bg-accent/10 text-accent hover:border-accent/70 hover:bg-accent/20 hover:text-white'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`;
        const mobileClasses = `flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
          isSports && isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500'
            : isSports
              ? 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
            : isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500'
              : item.external
                ? 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`;

        return item.external ? (
          <a
            key={item.path}
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={mobile ? mobileClasses : desktopClasses}
          >
            {item.icon}
            {item.title}
          </a>
        ) : (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={mobile ? mobileClasses : desktopClasses}
          >
            {item.icon}
            {item.title}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
        <div className="relative flex min-h-16 items-center justify-between gap-3 py-2 lg:grid lg:min-h-20 lg:grid-cols-[1fr_auto_1fr]">
          <Link
            to="/"
            className="hidden h-12 w-28 shrink-0 items-center justify-center overflow-hidden lg:flex lg:justify-self-start"
            aria-label="RabbitMeow home"
          >
            <img src={Logo} alt="RabbitMeow" className="h-10 w-24 object-contain opacity-80" />
          </Link>
          <nav className="hidden items-center gap-1 rounded-xl border border-white/10 bg-black/35 p-1 shadow-lg lg:flex lg:justify-self-center">
            <NavLinks />
          </nav>

          <div className="relative mx-1 flex-1 lg:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-xl border-white/10 bg-white/10 pl-9 text-white placeholder:text-white/50 focus:bg-white/15"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  ref={mobileSearchInputRef}
                />
              </div>
            </form>
            <SearchSuggestions containerRef={mobileSuggestionsRef} />
          </div>

          <div className="relative hidden shrink-0 lg:flex lg:justify-self-end">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  type="search"
                  placeholder="Search... (Press /)"
                  className="h-10 w-44 rounded-xl border-white/10 bg-white/10 pl-9 text-white placeholder:text-white/50 transition-all duration-300 focus:w-60 focus:bg-white/15 xl:w-52 xl:focus:w-72"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  ref={desktopSearchInputRef}
                />
                <SearchSuggestions containerRef={desktopSuggestionsRef} />
                {showKeyboardHint && (
                  <button
                    type="button"
                    onClick={() => setShowKeyboardHint(false)}
                    className="absolute right-0 top-full z-50 mt-2 rounded-lg border border-white/10 bg-black/90 p-2 text-xs text-white shadow-xl hover:bg-black/80"
                  >
                    <span className="flex items-center"><Keyboard className="mr-1 h-3 w-3 text-accent" />Press / for quick search</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          <button
            type="button"
            className="rounded-xl border border-white/10 p-2.5 text-white transition-colors hover:bg-white/10 active:bg-white/15 lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white/10 pb-3 pt-2 lg:hidden">
            <div className="mb-2 flex items-center gap-3 px-2">
              <img src={Logo} alt="RabbitMeow" className="h-8 w-16 object-contain opacity-80" />
              <span className="text-sm font-semibold text-white/85">RabbitMeow</span>
            </div>
            <nav className="grid gap-1 rounded-xl border border-white/10 bg-black/35 p-2">
              <NavLinks mobile />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
