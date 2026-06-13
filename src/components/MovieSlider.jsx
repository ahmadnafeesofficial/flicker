import { useRef, useEffect } from 'react';
import MovieCard from './MovieCard';

export default function MovieSlider({ 
  title, 
  icon, 
  movies, 
  favorites, 
  onToggleFavorite, 
  onOpenModal, 
  onPlay, 
  onSeeAll 
}) {
  const trackRef = useRef(null);

  const slideLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ 
        left: -trackRef.current.clientWidth * 0.75, 
        behavior: 'smooth' 
      });
    }
  };

  const slideRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ 
        left: trackRef.current.clientWidth * 0.75, 
        behavior: 'smooth' 
      });
    }
  };

  // Bind interactive click/touch drag scroll controls
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e) => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    };

    const handleMouseUpOrLeave = () => {
      isDown = false;
      track.classList.remove('dragging');
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // multiplier
      track.scrollLeft = scrollLeft - walk;
    };

    track.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUpOrLeave);
    track.addEventListener('mouseleave', handleMouseLeave);
    track.addEventListener('mousemove', handleMouseMove);

    function handleMouseLeave() {
      isDown = false;
      track.classList.remove('dragging');
    }

    // Touch support for swiping
    let touchStart = 0;
    let touchScrollLeft = 0;

    const handleTouchStart = (e) => {
      touchStart = e.touches[0].pageX;
      touchScrollLeft = track.scrollLeft;
    };

    const handleTouchMove = (e) => {
      const dx = e.touches[0].pageX - touchStart;
      track.scrollLeft = touchScrollLeft - dx;
    };

    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      track.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUpOrLeave);
      track.removeEventListener('mouseleave', handleMouseLeave);
      track.removeEventListener('mousemove', handleMouseMove);
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">
          {icon && <i className={`bi ${icon} section-icon`}></i>}
          {title}
        </h2>
        <span className="see-all-link" onClick={onSeeAll}>See All</span>
      </div>
      
      <div className="slider-wrapper">
        <button className="slider-arrow left" onClick={slideLeft}>
          <i className="bi bi-chevron-left"></i>
        </button>
        
        <div ref={trackRef} className="slider-track">
          {movies && movies.length > 0 ? (
            movies.map(movie => {
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
          ) : (
            <div className="empty-state" style={{ width: '100%', padding: '20px 0' }}>
              <i className="bi bi-film"></i>
              <p>No movies available</p>
            </div>
          )}
        </div>
        
        <button className="slider-arrow right" onClick={slideRight}>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
