import { useState, useEffect } from 'react';

export default function Hero({ movie, onPlay, onOpenInfo }) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);

  // Load background image on mount
  useEffect(() => {
    if (movie) {
      const img = new Image();
      img.onload = () => setBgLoaded(true);
      img.onerror = () => {
        setBgLoaded(true);
        setBgError(true);
      };
      img.src = movie.backdrop || movie.poster || '';
    }
  }, [movie]);

  if (!movie) {
    return (
      <section id="hero">
        <div className="skeleton skeleton-hero" id="heroSkeleton"></div>
      </section>
    );
  }

  const bgUrl = movie.backdrop || movie.poster || '';
  const backdropStyle = (!bgError && bgUrl)
    ? { backgroundImage: `url('${bgUrl}')` }
    : { background: 'linear-gradient(135deg, #181818 0%, #111 100%)' };

  return (
    <section id="hero">
      {!bgLoaded && <div className="skeleton skeleton-hero" id="heroSkeleton"></div>}
      
      <div 
        className="hero-backdrop" 
        id="heroBackdrop" 
        style={backdropStyle}
      ></div>
      <div className="hero-overlay"></div>
      
      <div 
        className="hero-content" 
        id="heroContent" 
        style={{ display: bgLoaded ? 'block' : 'none' }}
      >
        <div className="hero-genre-badges" id="heroGenres">
          {movie.genres.map((genre, idx) => (
            <span key={idx} className="hero-genre-badge">{genre}</span>
          ))}
        </div>
        <h1 className="hero-title" id="heroTitle">{movie.title}</h1>
        <div className="hero-meta">
          <span className="hero-rating">
            <i className="bi bi-star-fill"></i>
            <span id="heroRating">{movie.rating.toFixed(1)}</span>
          </span>
          <span className="hero-dot"></span>
          <span className="hero-year" id="heroYear">{movie.year}</span>
        </div>
        <p className="hero-desc" id="heroDesc">{movie.description}</p>
        <div className="hero-actions">
          <button className="btn-play" id="heroPlayBtn" onClick={onPlay}>
            <i className="bi bi-play-fill" style={{ fontSize: '1.2em' }}></i> Play
          </button>
          <button className="btn-more-info" id="heroInfoBtn" onClick={onOpenInfo}>
            <i className="bi bi-info-circle"></i> More Info
          </button>
        </div>
      </div>
    </section>
  );
}
