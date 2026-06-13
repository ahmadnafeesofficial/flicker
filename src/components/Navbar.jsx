import { useState, useEffect, useRef } from 'react';

export default function Navbar({ activeSection, favoritesCount, searchQuery, onSearchChange, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const mobileNavRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Monitor window scroll to add sticky visual background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for clicks outside mobile drawer to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && mobileNavRef.current && hamburgerRef.current) {
        if (!mobileNavRef.current.contains(e.target) && !hamburgerRef.current.contains(e.target)) {
          setMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  const toggleSearch = () => {
    setSearchOpen(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        onSearchChange('');
      }
      return next;
    });
  };

  const handleLinkClick = (e, view, category = null) => {
    e.preventDefault();
    onNavigate(view, category);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="navbar-logo" onClick={(e) => handleLinkClick(e, 'home')}>Flicker</a>

        <ul className="navbar-links" id="desktopLinks">
          <li>
            <a 
              href="#" 
              className={activeSection === 'home' ? 'active' : ''} 
              onClick={(e) => handleLinkClick(e, 'home')}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeSection === 'movies' ? 'active' : ''} 
              onClick={(e) => handleLinkClick(e, 'category', 'popular')}
            >
              Movies
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeSection === 'trending' ? 'active' : ''} 
              onClick={(e) => handleLinkClick(e, 'category', 'trending')}
            >
              Trending
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeSection === 'mylist' ? 'active' : ''} 
              onClick={(e) => handleLinkClick(e, 'category', 'favorites')}
            >
              My List
            </a>
          </li>
        </ul>

        <div className="navbar-right">
          {/* Search bar inside header */}
          <div className="search-container">
            <button 
              className="search-toggle-btn" 
              id="searchToggleBtn" 
              title="Search" 
              onClick={toggleSearch}
            >
              <i className={searchOpen ? 'bi bi-x-lg' : 'bi bi-search'}></i>
            </button>
            <div className={`search-input-wrap ${searchOpen ? 'open' : ''}`} id="searchInputWrap">
              <input 
                ref={searchInputRef}
                type="text" 
                id="searchInput" 
                placeholder="Titles, genres, ratings, years..." 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoComplete="off" 
              />
            </div>
          </div>

          {/* Bookmark Badge */}
          <button 
            className="navbar-icon-btn" 
            title="My List" 
            onClick={(e) => handleLinkClick(e, 'category', 'favorites')}
          >
            <i className="bi bi-bookmark-heart"></i>
            {favoritesCount > 0 && (
              <span className="fav-badge" id="favBadge">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger menu */}
          <button 
            ref={hamburgerRef}
            className="hamburger-btn" 
            id="hamburgerBtn" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            <i className={mobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'}></i>
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div 
        ref={mobileNavRef}
        className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} 
        id="mobileNav"
      >
        <a 
          href="#" 
          className={activeSection === 'home' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, 'home')}
        >
          Home
        </a>
        <a 
          href="#" 
          className={activeSection === 'movies' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, 'category', 'popular')}
        >
          Movies
        </a>
        <a 
          href="#" 
          className={activeSection === 'trending' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, 'category', 'trending')}
        >
          Trending
        </a>
        <a 
          href="#" 
          className={activeSection === 'mylist' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, 'category', 'favorites')}
        >
          My List
        </a>
        <div className="mobile-search-wrap">
          <input 
            type="text" 
            id="mobileSearchInput" 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off" 
          />
        </div>
      </div>
    </>
  );
}
