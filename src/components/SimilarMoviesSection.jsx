
export default function SimilarMoviesSection({ similarMovies = [], onSelectMovie }) {
  if (!similarMovies || similarMovies.length === 0) return null;

  return (
    <div className="modal-similar-section">
      <div className="modal-detail-label" style={{ marginBottom: '12px' }}>Similar Movies</div>
      <div className="similar-grid" id="modalSimilarGrid">
        {similarMovies.map(m => (
          <div 
            key={m.id} 
            className="movie-card" 
            onClick={() => onSelectMovie(m)}
            data-id={m.id}
          >
            <div className="card-img-wrap" style={{ aspectRatio: '2/3' }}>
              {m.poster ? (
                <img src={m.poster} alt={m.title} loading="lazy" />
              ) : (
                <div className="card-fallback-wrap">
                  <i className="bi bi-film" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
                </div>
              )}
              <div className="card-rating" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>
                <i className="bi bi-star-fill" style={{ fontSize: '0.65em' }}></i>
                {m.rating.toFixed(1)}
              </div>
              <div className="card-overlay" style={{ padding: '6px' }}>
                <div className="card-title-overlay" style={{ fontSize: '0.65rem', marginBottom: 0 }}>{m.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
