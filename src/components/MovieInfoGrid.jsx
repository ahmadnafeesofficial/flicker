
export default function MovieInfoGrid({ cast = [], director, releaseDate, boxOffice }) {
  const castList = Array.isArray(cast) ? cast.slice(0, 5).join(', ') : '';
  
  return (
    <div className="modal-details-grid">
      <div className="modal-detail-item">
        <div className="modal-detail-label">Cast</div>
        <div className="modal-detail-val">{castList || 'N/A'}</div>
      </div>
      <div className="modal-detail-item">
        <div className="modal-detail-label">Director</div>
        <div className="modal-detail-val">{director || 'N/A'}</div>
      </div>
      <div className="modal-detail-item">
        <div className="modal-detail-label">Release Date</div>
        <div className="modal-detail-val">{releaseDate || 'N/A'}</div>
      </div>
      <div className="modal-detail-item">
        <div className="modal-detail-label">Box Office</div>
        <div className="modal-detail-val">{boxOffice || 'N/A'}</div>
      </div>
    </div>
  );
}
