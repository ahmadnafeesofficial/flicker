
export default function Footer({ onNavigate }) {
  return (
    <footer id="siteFooter">
      <div>
        <a href="#" className="footer-logo" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Flicker</a>
        
        <div className="footer-social">
          <a href="#" title="Facebook"><i className="bi bi-facebook"></i></a>
          <a href="#" title="Instagram"><i className="bi bi-instagram"></i></a>
          <a href="#" title="Twitter"><i className="bi bi-twitter-x"></i></a>
          <a href="#" title="YouTube"><i className="bi bi-youtube"></i></a>
        </div>
        
        <div className="footer-nav-grid">
          <div className="footer-col">
            <div className="footer-col-title">Navigate</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'popular'); }}>Movies</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'trending'); }}>Trending</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'favorites'); }}>My List</a>
          </div>
          
          <div className="footer-col">
            <div className="footer-col-title">Genres</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'action'); }}>Action</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'comedy'); }}>Comedy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'drama'); }}>Drama</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('category', 'trending'); }}>Thriller</a>
          </div>
          
          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <a href="#" onClick={(e) => e.preventDefault()}>Profile</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Settings</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Help</a>
          </div>
          
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="#" onClick={(e) => e.preventDefault()}>About</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Press</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <span className="footer-copyright">&copy; 2026 Flicker. All rights reserved.</span>
          <span className="footer-tagline">Stream Everything, Anytime.</span>
        </div>
      </div>
    </footer>
  );
}
