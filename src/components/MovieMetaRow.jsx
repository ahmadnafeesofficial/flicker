
export default function MovieMetaRow({ rating, year, runtime, originalLanguage }) {
  return (
    <div className="modal-meta-row">
      <span className="modal-rating">
        <i className="bi bi-star-fill" style={{ fontSize: '0.85em' }}></i>&nbsp;
        {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
      </span>
      <span className="modal-year">{year}</span>
      <span className="modal-runtime">{runtime} min</span>
      <span className="modal-lang">{(originalLanguage || '').toUpperCase()}</span>
    </div>
  );
}
