
export default function ModalBackdrop({ 
  movie, 
  isFav, 
  onPlay, 
  onToggleFavorite, 
  onShare 
}) {
  return (
    <div className="modal-backdrop-wrap">
      {movie.backdrop ? (
        <img src={movie.backdrop} alt={movie.title} className="modal-backdrop-img" />
      ) : (
        <div className="card-fallback-wrap" style={{ height: '100%', borderRadius: 0 }}>
          <i className="bi bi-film" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
        </div>
      )}
      <div className="modal-backdrop-gradient"></div>
      
      <div className="modal-play-overlay">
        <button className="modal-play-btn" onClick={onPlay}>
          <i className="bi bi-play-fill"></i> Play
        </button>
        <button 
          className={`modal-action-btn ${isFav ? 'active' : ''}`} 
          id="modalFavBtn" 
          onClick={() => onToggleFavorite(movie)}
          title={isFav ? 'Remove from My List' : 'Add to My List'}
        >
          <i className={`bi ${isFav ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
        </button>
        <button 
          className="modal-action-btn" 
          id="modalShareBtn" 
          onClick={onShare}
          title="Share deep link"
        >
          <i className="bi bi-share"></i>
        </button>
      </div>
    </div>
  );
}
