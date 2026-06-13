import { useState, useEffect, useRef } from 'react';

export default function MovieCard({ movie, isFavorite, onToggleFavorite, onOpenModal, onPlay }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Self-contained lazy loader using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = () => {
    onOpenModal(movie);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPlay();
  };

  const handleFavClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(movie);
  };

  const poster = movie.poster;

  return (
    <div 
      ref={cardRef} 
      className="movie-card" 
      onClick={handleCardClick}
      data-id={movie.id}
    >
      <div className="card-img-wrap">
        {isVisible ? (
          <>
            {poster && !imageError ? (
              <img 
                src={imageLoaded ? poster : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}
                data-src={poster}
                alt={movie.title} 
                className={`lazy ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(true);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="card-fallback-wrap">
                <i className="bi bi-film" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
                <div className="card-fallback-title">{movie.title}</div>
              </div>
            )}
          </>
        ) : (
          <div className="skeleton-card skeleton" style={{ width: '100%', height: '100%', border: 'none' }}></div>
        )}
        
        <div className="card-rating">
          <i className="bi bi-star-fill" style={{ fontSize: '0.6em' }}></i>
          {movie.rating.toFixed(1)}
        </div>

        <div className="card-overlay">
          <div className="card-title-overlay">{movie.title}</div>
          <div className="card-actions">
            <button 
              className="card-btn play-btn" 
              onClick={handlePlayClick} 
              title="Play"
            >
              <i className="bi bi-play-fill"></i>
            </button>
            <button 
              className={`card-btn fav-btn ${isFavorite ? 'fav-active' : ''}`} 
              onClick={handleFavClick} 
              title={isFavorite ? 'Remove from My List' : 'Add to My List'}
            >
              <i className={`bi ${isFavorite ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
            </button>
            <span className="card-year-small">{movie.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
