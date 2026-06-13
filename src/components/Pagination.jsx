
export default function Pagination({ activePage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrevPage = () => {
    if (activePage > 1) {
      onPageChange(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      onPageChange(activePage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const range = 2; // Page buffer range

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= activePage - range && i <= activePage + range)) {
        pages.push(
          <button 
            key={i} 
            className={`page-num ${i === activePage ? 'active' : ''}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>
        );
      } else if (i === 2 || i === totalPages - 1) {
        pages.push(<span key={i} className="page-ellipsis">...</span>);
      }
    }

    // Filter consecutive duplicate ellipsis elements
    return pages.filter((el, idx, arr) => {
      if (el.type === 'span' && arr[idx - 1]?.type === 'span') return false;
      return true;
    });
  };

  return (
    <div className="pagination-container">
      <button 
        className="btn-pagination" 
        id="btnPrevPage" 
        onClick={handlePrevPage}
        disabled={activePage === 1}
      >
        <i className="bi bi-chevron-left"></i> Prev
      </button>
      
      <div className="pagination-pages" id="paginationPages">
        {renderPageNumbers()}
      </div>
      
      <button 
        className="btn-pagination" 
        id="btnNextPage" 
        onClick={handleNextPage}
        disabled={activePage === totalPages}
      >
        Next <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}
