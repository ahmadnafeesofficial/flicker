
export default function CategoryHeader({
  title,
  desc,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="category-header">
      <h2>{title}</h2>
      <p>{desc}</p>

      <div className="category-controls">
        {/* Category Search Input */}
        <div className="category-search-wrap">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search within this category..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Category Sorting Dropdown */}
        <div className="category-sort-wrap">
          <label htmlFor="categorySortSelect">Sort by:</label>
          <select 
            id="categorySortSelect"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
    </div>
  );
}
