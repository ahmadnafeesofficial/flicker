import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieSlider from './components/MovieSlider';
import CategoryPage from './components/CategoryPage';
import SearchOverlay from './components/SearchOverlay';
import MovieDetailsModal from './components/MovieDetailsModal';
import Footer from './components/Footer';
import GlobalError from './components/GlobalError';
import StartupLoader from './components/StartupLoader';
import ToastContainer from './components/ToastContainer';
import { FlickerAPI } from './services/api';

const FAV_KEY = 'flicker_favorites';

export default function App() {
  // Application State
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage:', e);
    }
    return [];
  });
  const [activeView, setActiveView] = useState('home'); // 'home' | 'category'
  const [activeCategory, setActiveCategory] = useState(null); // category key
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeModalMovie, setActiveModalMovie] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastLoadedPage, setLastLoadedPage] = useState(0);

  // Toast notification manager
  const showToast = useCallback((message, icon = 'bi-info-circle') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon, out: false }]);
    
    // Animate out trigger
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, out: true } : t));
      // Delete from state after fade out completes
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 400);
    }, 2600);
  }, []);

  // 1. Startup initialization
  useEffect(() => {
    // Handles deep link mapping (?movie=ID)
    const handleDeepLink = async (currentPool) => {
      const params = new URLSearchParams(window.location.search);
      const movieId = params.get('movie');
      if (!movieId) return;

      const movie = currentPool.find(m => String(m.id) === String(movieId));
      if (movie) {
        setActiveModalMovie(movie);
      } else {
        // Fetch more pages in search of deep-linked item
        try {
          showToast('Searching wider pool for deep-linked movie...', 'bi-hourglass-split');
          await FlickerAPI.fetchMorePages(10);
          const expandedPool = FlickerAPI.getAllMovies();
          setMovies(expandedPool);
          setLastLoadedPage(FlickerAPI.lastLoadedPage);
          const matched = expandedPool.find(m => String(m.id) === String(movieId));
          if (matched) {
            setActiveModalMovie(matched);
          } else {
            showToast('Linked movie could not be found.', 'bi-exclamation-triangle-fill');
          }
        } catch (err) {
          console.error('Deep link look up failed:', err);
        }
      }
    };

    // Load initial 100 movies
    const loadStartupData = async () => {
      try {
        setLoading(true);
        const startupPool = await FlickerAPI.fetchInitialPool();
        setMovies(startupPool);
        setLastLoadedPage(FlickerAPI.lastLoadedPage);
        setLoading(false);

        // Check deep link query triggers
        handleDeepLink(startupPool);
      } catch (err) {
        console.error('Startup data loading failed:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadStartupData();
  }, [showToast]);

  // Synchronize favorites changes to localstorage
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Escape key event listener to close modal or overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalMovie(null);
        if (searchQuery) setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // 2. Real-time Search Debouncing
  useEffect(() => {
    let active = true;
    if (!searchQuery.trim()) {
      const resetTimer = setTimeout(() => {
        if (active) {
          setSearchResults([]);
          setSearchLoading(false);
        }
      }, 0);
      return () => {
        active = false;
        clearTimeout(resetTimer);
      };
    }

    const startTimer = setTimeout(() => {
      if (active) setSearchLoading(true);
    }, 0);

    const delay = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const terms = query.split(/\s+/).filter(Boolean);
      
      const filtered = movies.filter(movie => {
        return terms.every(term => {
          if (movie.title.toLowerCase().includes(term)) return true;
          if (movie.genres.some(g => g.toLowerCase().includes(term))) return true;
          if (String(movie.year).includes(term)) return true;
          if (!isNaN(term)) {
            const num = parseFloat(term);
            if (num >= 1 && num <= 10 && movie.rating >= num) return true;
          }
          if (movie.cast.some(actor => actor.toLowerCase().includes(term))) return true;
          if (movie.director.toLowerCase().includes(term)) return true;
          return false;
        });
      });

      if (active) {
        setSearchResults(filtered);
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(startTimer);
      clearTimeout(delay);
    };
  }, [searchQuery, movies]);


  // Navigation controller
  const handleNavigate = (view, category = null) => {
    setActiveView(view);
    setActiveCategory(category);
    setSearchQuery(''); // Reset search input on route changes
  };

  // Toggle Favorite
  const handleToggleFavorite = (movie) => {
    if (!movie || !movie.id) return;
    const isFav = favorites.some(f => String(f.id) === String(movie.id));
    if (isFav) {
      setFavorites(prev => prev.filter(f => String(f.id) !== String(movie.id)));
      showToast(`Removed from My List`, 'bi-bookmark-dash');
    } else {
      setFavorites(prev => [...prev, movie]);
      showToast(`Added "${movie.title}" to My List`, 'bi-bookmark-heart-fill');
    }
  };

  // Lazy Fetch more movies from API
  const handleFetchMoreMovies = async () => {
    try {
      await FlickerAPI.fetchMorePages(5);
      const updatedPool = FlickerAPI.getAllMovies();
      setMovies(updatedPool);
      setLastLoadedPage(FlickerAPI.lastLoadedPage);
      return true;
    } catch (err) {
      console.error('Failed to load extra pages:', err);
      showToast('Connection issue. Failed to load more movies.', 'bi-exclamation-triangle-fill');
      return false;
    }
  };

  // Navigation highlights syncing mapper
  const getActiveSectionHighlight = () => {
    if (searchQuery) return 'search';
    if (activeView === 'category') {
      return activeCategory === 'favorites' ? 'mylist' : 'movies';
    }
    return 'home';
  };

  const heroMovie = movies.filter(m => m.rating >= 7.0)[0] || movies[0];

  return (
    <>
      <Navbar 
        activeSection={getActiveSectionHighlight()}
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
      />

      {/* Global Error Display */}
      {error && <GlobalError />}

      {/* Startup Loader display */}
      {loading && !error && <StartupLoader />}

      {/* Main Content Router */}
      {!loading && !error && (
        <>
          {/* Main Home Grid View */}
          {activeView === 'home' && !searchQuery && (
            <div id="mainPage" style={{ display: 'block' }}>
              <Hero 
                key={heroMovie?.id}
                movie={heroMovie}
                onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                onOpenInfo={() => setActiveModalMovie(heroMovie)}
              />
              
              <div className="content-area">
                <MovieSlider 
                  title="Trending Now"
                  icon="bi-fire"
                  movies={[...movies].sort((a, b) => (a.id % 13) - (b.id % 13)).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'trending')}
                />
                <MovieSlider 
                  title="Popular Movies"
                  icon="bi-star"
                  movies={[...movies].sort((a,b) => b.rating - a.rating).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'popular')}
                />
                <MovieSlider 
                  title="New Releases"
                  icon="bi-calendar-event"
                  movies={[...movies].sort((a,b) => parseInt(b.year, 10) - parseInt(a.year, 10)).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'new-releases')}
                />
                <MovieSlider 
                  title="Top Rated"
                  icon="bi-trophy"
                  movies={[...movies].filter(m => m.rating >= 7.8).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'top-rated')}
                />
                <MovieSlider 
                  title="Action Movies"
                  icon="bi-lightning"
                  movies={movies.filter(m => m.genres.includes('Action')).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'action')}
                />
                <MovieSlider 
                  title="Comedy Movies"
                  icon="bi-emoji-laughing"
                  movies={movies.filter(m => m.genres.includes('Comedy')).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'comedy')}
                />
                <MovieSlider 
                  title="Drama Movies"
                  icon="bi-mask"
                  movies={movies.filter(m => m.genres.includes('Drama')).slice(0, 15)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenModal={setActiveModalMovie}
                  onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
                  onSeeAll={() => handleNavigate('category', 'drama')}
                />
              </div>
            </div>
          )}

          {/* Dynamic Grid Category See-All Page */}
          {activeView === 'category' && !searchQuery && (
            <CategoryPage 
              key={activeCategory}
              categoryKey={activeCategory}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onOpenModal={setActiveModalMovie}
              onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
              allMovies={movies}
              lastLoadedPage={lastLoadedPage}
              onFetchMoreMovies={handleFetchMoreMovies}
            />
          )}

          {/* Debounced Search overlay */}
          <SearchOverlay 
            query={searchQuery}
            results={searchResults}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenModal={setActiveModalMovie}
            onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
            loading={searchLoading}
          />
        </>
      )}

      {/* Footer layout */}
      {!loading && <Footer onNavigate={handleNavigate} />}

      {/* Modal Layout details overlay */}
      <MovieDetailsModal 
        movie={activeModalMovie}
        onClose={() => setActiveModalMovie(null)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onPlay={() => showToast('Starting playback…', 'bi-play-fill')}
        allMovies={movies}
        showToast={showToast}
        onSelectMovie={setActiveModalMovie}
      />

      {/* Render Toast alerts list */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
