import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import CategoryHeader from './CategoryHeader';
import Pagination from './Pagination';

export default function CategoryPage({ 
  categoryKey, 
  favorites, 
  onToggleFavorite, 
  onOpenModal, 
  onPlay, 
  allMovies, 
  lastLoadedPage, 
  onFetchMoreMovies 
}) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(() => {
    if (categoryKey === 'new-releases') return 'release_date';
    if (categoryKey === 'trending') return 'popularity';
    return 'rating';
  });
  const [fetching, setFetching] = useState(false);

  // Page Category Meta configuration
  const headers = {
    'trending': { title: 'Trending Movies', desc: 'The most popular movies streamed right now' },
    'popular': { title: 'Popular Movies', desc: 'Highly watched movies loved by audiences' },
    'top-rated': { title: 'Top Rated Movies', desc: 'Critically acclaimed titles with outstanding ratings' },
    'new-releases': { title: 'New Releases', desc: 'The latest additions to the library' },
    'action': { title: 'Action Movies', desc: 'Adrenaline-pumping action and high-octane blockbusters' },
    'comedy': { title: 'Comedy Movies', desc: 'Laugh-out-loud comedies and lighthearted stories' },
    'drama': { title: 'Drama Movies', desc: 'Compelling narratives and deep emotional stories' },
    'favorites': { title: 'My List', desc: 'Your personal library of movies to watch later' }
  };

  const currentHeader = headers[categoryKey] || { title: 'Movies', desc: 'Browse our collection' };

  // 1. Filter movies by category criteria
  const getFilteredByCategory = () => {
    switch (categoryKey) {
      case 'trending':
        return [...allMovies];
      case 'popular':
        return allMovies.filter(m => m.rating >= 6.5);
      case 'top-rated':
        return allMovies.filter(m => m.rating >= 8.0);
      case 'new-releases':
        return allMovies.filter(m => {
          const yr = parseInt(m.year, 10);
          return !isNaN(yr) && yr >= 2012;
        });
      case 'action':
        return allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'action'));
      case 'comedy':
        return allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'comedy'));
      case 'drama':
        return allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'drama'));
      case 'favorites':
        return [...favorites];
      default:
        return [...allMovies];
    }
  };

  const categoryFiltered = getFilteredByCategory();

  // 2. Pre-fetch more movies from API if paginating past the loaded local pool
  const itemsPerPage = 20;
  const targetIndex = page * itemsPerPage;

  useEffect(() => {
    if (categoryKey === 'favorites') return;
    
    if (categoryFiltered.length < targetIndex && lastLoadedPage < 40) {
      const loadMore = async () => {
        setFetching(true);
        await onFetchMoreMovies();
        setFetching(false);
      };
      loadMore();
    }
  }, [categoryFiltered.length, lastLoadedPage, categoryKey, onFetchMoreMovies, targetIndex]);

  // 3. Filter by search input
  let filtered = [...categoryFiltered];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.genres.some(g => g.toLowerCase().includes(q)) ||
      m.year.includes(q)
    );
  }

  // 4. Apply sorting
  if (sortBy === 'popularity') {
    filtered.sort((a, b) => {
      const weightA = a.rating * 1.5 + (parseInt(a.year, 10) || 0) * 0.05;
      const weightB = b.rating * 1.5 + (parseInt(b.year, 10) || 0) * 0.05;
      return weightB - weightA;
    });
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'release_date') {
    filtered.sort((a, b) => {
      const valA = parseInt(a.year, 10) || 0;
      const valB = parseInt(b.year, 10) || 0;
      return valB - valA;
    });
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // 5. Paginate results
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Guard page limit
  const activePage = page > totalPages ? totalPages : page;

  const startIdx = (activePage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="categoryPage" className="page-container active">
      <CategoryHeader
        title={currentHeader.title}
        desc={currentHeader.desc}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setPage(1);
        }}
      />

      {/* Loading Spinner */}
      <div className={`page-loader ${fetching ? 'active' : ''}`} id="categoryPageLoader">
        <div className="spinner"></div>
      </div>

      <div className="category-grid" id="categoryGrid">
        {paginatedList.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', width: '100%', padding: '80px 0' }}>
            <i className="bi bi-search"></i>
            <p>No movies match your selection criteria</p>
          </div>
        ) : (
          paginatedList.map(movie => {
            const isFav = favorites.some(f => String(f.id) === String(movie.id));
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={isFav}
                onToggleFavorite={onToggleFavorite}
                onOpenModal={onOpenModal}
                onPlay={onPlay}
              />
            );
          })
        )}
      </div>

      <Pagination
        activePage={activePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
