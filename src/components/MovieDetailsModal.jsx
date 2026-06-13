import { useEffect, useRef } from 'react';
import ModalBackdrop from './ModalBackdrop';
import MovieMetaRow from './MovieMetaRow';
import MovieInfoGrid from './MovieInfoGrid';
import GenreList from './GenreList';
import SimilarMoviesSection from './SimilarMoviesSection';

export default function MovieDetailsModal({ 
  movie, 
  onClose, 
  favorites, 
  onToggleFavorite, 
  onPlay, 
  allMovies, 
  showToast,
  onSelectMovie
}) {
  const modalBoxRef = useRef(null);

  // Close modal on outside clicks or when modalBox is target
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Reset modal scroll position on movie change
  useEffect(() => {
    if (movie && modalBoxRef.current) {
      modalBoxRef.current.scrollTop = 0;
    }
  }, [movie]);

  if (!movie) return null;

  const isFav = favorites.some(f => String(f.id) === String(movie.id));

  // Determine similar movies: share at least one genre
  const getSimilarMovies = () => {
    const currentId = String(movie.id);
    let similar = allMovies.filter(m => {
      if (String(m.id) === currentId) return false;
      return m.genres.some(genre => movie.genres.includes(genre));
    });

    // Fallback if not enough similar movies
    if (similar.length < 6) {
      const ids = new Set(similar.map(s => String(s.id)));
      const fillers = allMovies.filter(m => 
        String(m.id) !== currentId && !ids.has(String(m.id))
      );
      similar = similar.concat(fillers);
    }

    // Sort by rating desc and slice 6
    return similar.sort((a, b) => b.rating - a.rating).slice(0, 6);
  };

  const similarMovies = getSimilarMovies();

  // Share deep-link copy handler
  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?movie=${movie.id}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast('Link copied to clipboard!', 'bi-share-fill');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy link.', 'bi-exclamation-triangle-fill');
      });
  };

  return (
    <div 
      className="modal-overlay open" 
      onClick={handleOverlayClick}
    >
      <div ref={modalBoxRef} className="modal-box" id="modalBox">
        <button className="modal-close-btn" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <ModalBackdrop
          movie={movie}
          isFav={isFav}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
          onShare={handleShareClick}
        />

        <div className="modal-body-content">
          <h2 className="modal-title">{movie.title}</h2>
          
          <MovieMetaRow
            rating={movie.rating}
            year={movie.year}
            runtime={movie.runtime}
            originalLanguage={movie.originalLanguage}
          />

          <p className="modal-desc">{movie.description}</p>
          
          <MovieInfoGrid
            cast={movie.cast}
            director={movie.director}
            releaseDate={movie.releaseDate}
            boxOffice={movie.boxOffice}
          />

          <GenreList genres={movie.genres} />

          <SimilarMoviesSection
            similarMovies={similarMovies}
            onSelectMovie={onSelectMovie}
          />
        </div>
      </div>
    </div>
  );
}
