
export default function GenreList({ genres = [] }) {
  if (!genres || genres.length === 0) return null;
  
  return (
    <>
      <div className="modal-detail-label" style={{ marginBottom: '8px' }}>Genres</div>
      <div className="modal-genres">
        {genres.map((genre, idx) => (
          <span key={idx} className="modal-genre-chip">{genre}</span>
        ))}
      </div>
    </>
  );
}
