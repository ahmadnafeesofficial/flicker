/**
 * API Service for Flicker Movie platform
 */
const API_URL = 'https://jsonfakery.com/movies/paginated';
const MAX_PAGES = 500;

const pageCache = new Map();
const moviePool = new Map();

export const FlickerAPI = {
  lastLoadedPage: 0,
  totalMoviesCount: 0,

  /**
   * Fetch a single page with retry logic and caching
   */
  async fetchPage(page, retriesRemaining = 3) {
    if (pageCache.has(page)) {
      return pageCache.get(page);
    }

    try {
      const response = await fetch(`${API_URL}?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const json = await response.json();
      pageCache.set(page, json);

      if (json.total) {
        this.totalMoviesCount = json.total;
      }

      const movies = json.data || json || [];
      movies.forEach(movie => {
        if (movie && movie.id) {
          const processed = this.processMovieData(movie);
          moviePool.set(String(processed.id), processed);
        }
      });

      if (page > this.lastLoadedPage) {
        this.lastLoadedPage = page;
      }

      return json;
    } catch (error) {
      if (retriesRemaining > 1) {
        console.warn(`Fetch page ${page} failed. Retrying... (${retriesRemaining - 1} left)`);
        await new Promise(resolve => setTimeout(resolve, (4 - retriesRemaining) * 1000));
        return this.fetchPage(page, retriesRemaining - 1);
      }
      throw error;
    }
  },

  /**
   * Fetch multiple pages concurrently
   */
  async fetchPageRange(startPage, endPage) {
    const promises = [];
    for (let p = startPage; p <= endPage; p++) {
      if (p <= MAX_PAGES) {
        promises.push(this.fetchPage(p));
      }
    }
    await Promise.all(promises);
    return this.getAllMovies();
  },

  /**
   * Fetch the initial bulk pool of movies (pages 1 to 5)
   */
  async fetchInitialPool() {
    await this.fetchPageRange(1, 5);
    return this.getAllMovies();
  },

  /**
   * Fetch the next batch of pages
   */
  async fetchMorePages(pagesCount = 5) {
    const start = this.lastLoadedPage + 1;
    const end = this.lastLoadedPage + pagesCount;
    if (start > MAX_PAGES) return this.getAllMovies();

    await this.fetchPageRange(start, end);
    return this.getAllMovies();
  },

  /**
   * Get a movie by its ID from the local memory pool
   */
  getMovieById(id) {
    return moviePool.get(String(id)) || null;
  },

  /**
   * Get all processed movies in the pool as an array
   */
  getAllMovies() {
    return Array.from(moviePool.values());
  },

  /**
   * Process movie payload to map values and assign fallbacks
   */
  processMovieData(movie) {
    const id = String(movie.id || movie.movie_id || Math.random());
    const title = movie.original_title || movie.title || 'Untitled Movie';
    const description = movie.overview || movie.description || 'No description is available for this title at this time.';
    const rating = this.generateFallbackRating(movie);
    const year = this.extractReleaseYear(movie);
    
    const poster = movie.poster_path || movie.poster || '';
    const backdrop = movie.backdrop_path || movie.backdrop || poster || '';

    const genres = this.generateFallbackGenres(movie);
    const cast = this.generateFallbackCast(movie);
    const director = this.generateFallbackDirector(movie);
    const runtime = this.generateFallbackRuntime(movie);
    const releaseDate = this.formatReleaseDate(movie);
    const boxOffice = this.generateFallbackBoxOffice(movie);

    return {
      id,
      title,
      description,
      rating,
      year,
      poster,
      backdrop,
      genres,
      cast,
      director,
      runtime,
      releaseDate,
      boxOffice,
      originalLanguage: movie.original_language || 'en'
    };
  },

  /**
   * Extract year from release date
   */
  extractReleaseYear(movie) {
    if (movie.release_date) {
      const parts = movie.release_date.split('/');
      if (parts.length === 3) {
        return parts[2].trim().substring(0, 4);
      }
      const yearMatch = movie.release_date.match(/\b\d{4}\b/);
      if (yearMatch) return yearMatch[0];
    }
    return movie.year ? String(movie.year) : 'N/A';
  },

  /**
   * Normalizes and formats the release date string
   */
  formatReleaseDate(movie) {
    if (movie.release_date) {
      const dateStr = movie.release_date.replace(/^[A-Za-z]+,\s*/, '');
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return movie.release_date;
    }
    return movie.year ? `January 1, ${movie.year}` : 'N/A';
  },

  /**
   * Generates a stable fallback rating based on title/ID if missing or zero
   */
  generateFallbackRating(movie) {
    const rawRating = parseFloat(movie.vote_average || movie.rating || 0);
    if (rawRating > 0) return parseFloat(rawRating.toFixed(1));
    
    const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 5.5 + (hash % 38) * 0.1; // rating between 5.5 and 9.2
    return parseFloat(rating.toFixed(1));
  },

  /**
   * Categorizes movies into genres using simple keywords matching
   */
  generateFallbackGenres(movie) {
    if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
      return movie.genres;
    }
    if (movie.genre) {
      return Array.isArray(movie.genre) ? movie.genre : [movie.genre];
    }

    const text = ((movie.original_title || '') + ' ' + (movie.overview || '')).toLowerCase();
    const genres = [];

    if (/\b(action|fight|kill|war|battle|gun|shoot|chase|explosion|detective|cop|police|crime|danger|escape|force|soldier|army|weapon|mafia|gangster|superhero)\b/.test(text)) {
      genres.push('Action');
    }
    if (/\b(comedy|funny|laugh|humor|joke|hilarious|satire|fun|parody|clown|spoof|eccentric|amusing)\b/.test(text)) {
      genres.push('Comedy');
    }
    if (/\b(horror|scary|ghost|monster|vampire|zombie|devil|demon|witch|slasher|creepy|spooky|dead|blood|haunted|terror|gore)\b/.test(text)) {
      genres.push('Horror');
    }
    if (/\b(sci-fi|science|space|alien|future|futuristic|robot|galaxy|planet|technology|time travel|dimension|cyborg|starship)\b/.test(text)) {
      genres.push('Sci-Fi');
    }
    if (/\b(adventure|journey|quest|explore|travel|map|treasure|jungle|ship|island|mountain|sea|survival)\b/.test(text)) {
      genres.push('Adventure');
    }
    if (/\b(mystery|thriller|murder|killer|detective|secrets|conspiracy|agent|spy|investigate|psychological|kidnapped|suspense|panic|chase)\b/.test(text)) {
      if (!genres.includes('Thriller')) genres.push('Thriller');
    }
    if (/\b(romance|love|marry|husband|wife|wedding|dating|affection|girlfriend|boyfriend)\b/.test(text)) {
      genres.push('Romance');
    }
    if (/\b(drama|family|relationship|emotional|sad|life|tears|struggle|grief|death|story|tragedy|heartbreaking|biography|parent|child)\b/.test(text)) {
      if (!genres.includes('Drama')) genres.push('Drama');
    }

    if (genres.length === 0) {
      const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const defaults = ['Drama', 'Comedy', 'Action', 'Thriller', 'Romance', 'Sci-Fi', 'Adventure'];
      genres.push(defaults[hash % defaults.length]);
    }

    return genres.slice(0, 3);
  },

  /**
   * Parses casting arrays or generates fallback values
   */
  generateFallbackCast(movie) {
    if (movie.casts && Array.isArray(movie.casts) && movie.casts.length > 0) {
      return movie.casts.map(c => c.name || c.original_name);
    }
    if (movie.cast) {
      return Array.isArray(movie.cast) ? movie.cast : [movie.cast];
    }

    const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const actorPool = [
      'Leonardo DiCaprio', 'Scarlett Johansson', 'Tom Hanks', 'Meryl Streep', 
      'Brad Pitt', 'Robert Downey Jr.', 'Morgan Freeman', 'Christian Bale',
      'Zendaya', 'Cillian Murphy', 'Florence Pugh', 'Timothée Chalamet',
      'Margot Robbie', 'Denzel Washington', 'Emma Stone', 'Matt Damon',
      'Tom Hardy', 'Hugh Jackman', 'Natalie Portman', 'Joaquin Phoenix'
    ];
    
    const cast = [];
    const count = 3 + (hash % 3);
    for (let i = 0; i < count; i++) {
      const actor = actorPool[(hash + i * 7) % actorPool.length];
      if (!cast.includes(actor)) cast.push(actor);
    }
    return cast;
  },

  /**
   * Generates fallback director name
   */
  generateFallbackDirector(movie) {
    if (movie.director) return movie.director;

    const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const directors = [
      'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino',
      'James Cameron', 'Ridley Scott', 'David Fincher', 'Denis Villeneuve',
      'Peter Jackson', 'Alfred Hitchcock', 'Stanley Kubrick', 'Greta Gerwig',
      'Bong Joon Ho', 'Guillermo del Toro', 'Wes Anderson', 'Coen Brothers'
    ];
    return directors[hash % directors.length];
  },

  /**
   * Generates fallback runtime in minutes
   */
  generateFallbackRuntime(movie) {
    if (movie.runtime) return parseInt(movie.runtime, 10);

    const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 88 + (hash % 85);
  },

  /**
   * Generates fallback revenue / box office string
   */
  generateFallbackBoxOffice(movie) {
    if (movie.box_office) return movie.box_office;
    if (movie.revenue) {
      return `$${Number(movie.revenue).toLocaleString()}`;
    }
    const hash = String(movie.id || movie.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const amount = 5000000 + (hash % 450) * 1000000;
    return `$${amount.toLocaleString()}`;
  }
};
