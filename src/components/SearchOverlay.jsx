import MovieCard from './MovieCard';

export default function SearchOverlay({ 
  query, 
  results, 
  favorites, 
  onToggleFavorite, 
  onOpenModal, 
  onPlay, 
  loading 
}) {
  if (!query) return null;

  return (
    <div id="searchOverlay" className="active">
      <div className="search-results-header" id="searchResultsHeader">
        {loading ? (
          <span>Searching for <strong>"{query}"</strong>...</span>
        ) : (
          results.length === 0 ? (
            <span>No results for <strong>"{query}"</strong></span>
          ) : (
            <span>Showing <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for <strong>"{query}"</strong></span>
          )
        )}
      </div>

      <div className="search-grid" id="searchGrid">
        {loading ? (
          Array(6).fill(0).map((_, idx) => (
            <div key={idx} className="skeleton-card skeleton" style={{ width: '100%' }}></div>
          ))
        ) : (
          results.length === 0 ? (
            <div className="search-empty" style={{ gridColumn: '1 / -1' }}>
              <i className="bi bi-search"></i>
              <p>No movies found matching "{query}"</p>
            </div>
          ) : (
            results.map(movie => {
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
          )
        )}
      </div>
    </div>
  );
}
