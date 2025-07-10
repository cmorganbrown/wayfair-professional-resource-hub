/**
 * Database-Driven Search System for Wayfair Professional Resource Hub
 * 
 * This search system now uses API endpoints backed by SQLite database
 * instead of static JavaScript data files.
 */

class DatabaseSearchManager {
  constructor() {
    this.searchResults = [];
    this.currentSegment = null;
    this.currentQuery = '';
    this.isLoading = false;
    this.searchCache = new Map();
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.setupSegmentNavigation();
    console.log('🔍 Database search system initialized');
  }

  setupEventListeners() {
    // Search input handling
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(this.handleSearchInput.bind(this), 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch(e.target.value.trim());
        }
      });
    }

    // Search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const query = searchInput?.value?.trim() || '';
        this.performSearch(query);
      });
    }

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  setupSegmentNavigation() {
    // Industry segment cards
    const segmentCards = document.querySelectorAll('.segment-card');
    segmentCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const segment = card.getAttribute('data-segment');
        if (segment) {
          this.showSegmentArticles(segment);
          this.trackSegmentInteraction(segment);
        }
      });
    });

    // Navigation segment links
    const segmentLinks = document.querySelectorAll('[data-segment]');
    segmentLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const segment = link.getAttribute('data-segment');
        if (segment) {
          this.showSegmentArticles(segment);
        }
      });
    });
  }

  async handleSearchInput(event) {
    const query = event.target.value.trim();
    
    if (query.length < 2) {
      this.hideSearchResults();
      return;
    }

    await this.performSearch(query);
  }

  async performSearch(query, segment = null) {
    if (!query || query.length < 2) {
      this.showError('Please enter at least 2 characters to search');
      return;
    }

    this.isLoading = true;
    this.currentQuery = query;
    this.currentSegment = segment;
    
    try {
      this.showLoadingState();
      
      // Check cache first
      const cacheKey = `${query}-${segment || 'all'}`;
      if (this.searchCache.has(cacheKey)) {
        const cachedResults = this.searchCache.get(cacheKey);
        this.displaySearchResults(cachedResults, query);
        return;
      }

      // Build search URL
      const searchParams = new URLSearchParams({
        q: query,
        limit: 20
      });
      
      if (segment) {
        searchParams.append('segment', segment);
      }

      const response = await fetch(`/api/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const searchData = await response.json();
      
      // Cache results
      this.searchCache.set(cacheKey, searchData);
      
      this.searchResults = searchData.results || [];
      this.displaySearchResults(searchData, query);
      
      // Track search
      this.trackSearch(query, segment, this.searchResults.length);

    } catch (error) {
      console.error('Search error:', error);
      this.showError('Search temporarily unavailable. Please try again.');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  async showSegmentArticles(segment) {
    if (!segment) return;

    this.isLoading = true;
    this.currentSegment = segment;
    
    try {
      this.showLoadingState();
      
      const response = await fetch(`/api/segments/${segment}/articles?limit=20`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${segment} articles`);
      }

      const data = await response.json();
      
      this.searchResults = data.articles || [];
      this.displaySegmentResults(data, segment);
      
      // Track segment view
      this.trackSegmentView(segment, this.searchResults.length);

    } catch (error) {
      console.error('Segment loading error:', error);
      this.showError(`Failed to load ${segment} articles. Please try again.`);
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  async showAllArticles() {
    this.isLoading = true;
    
    try {
      this.showLoadingState();
      
      const response = await fetch('/api/articles?limit=50&sort=pain_level&order=DESC');
      
      if (!response.ok) {
        throw new Error('Failed to load articles');
      }

      const data = await response.json();
      
      this.searchResults = data.articles || [];
      this.displayAllArticlesResults(data);
      
      // Track all articles view
      this.trackAllArticlesView(this.searchResults.length);

    } catch (error) {
      console.error('All articles loading error:', error);
      this.showError('Failed to load articles. Please try again.');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  displaySearchResults(searchData, query) {
    const results = searchData.results || [];
    const modal = this.createSearchModal();
    
    let content = `
      <div class="search-modal-header">
        <h2>Search Results for "${query}"</h2>
        <button class="modal-close" onclick="searchManager.closeSearchModal()">&times;</button>
      </div>
      <div class="search-modal-body">
    `;

    if (results.length === 0) {
      content += `
        <div class="no-results">
          <h3>No articles found</h3>
          <p>Try different keywords or browse by industry segment</p>
        </div>
      `;
    } else {
      content += `<div class="search-stats">Found ${results.length} articles</div>`;
      content += '<div class="search-results-grid">';
      
      results.forEach(article => {
        content += this.createArticleCard(article);
      });
      
      content += '</div>';
    }

    content += '</div>';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);
  }

  displaySegmentResults(data, segment) {
    const results = data.articles || [];
    const segmentName = segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const modal = this.createSearchModal();
    
    let content = `
      <div class="search-modal-header">
        <h2>${segmentName} Articles</h2>
        <button class="modal-close" onclick="searchManager.closeSearchModal()">&times;</button>
      </div>
      <div class="search-modal-body">
    `;

    if (results.length === 0) {
      content += `
        <div class="no-results">
          <h3>No articles found for ${segmentName}</h3>
          <p>Check back soon for new content in this category</p>
        </div>
      `;
    } else {
      content += `<div class="search-stats">${results.length} articles for ${segmentName}</div>`;
      content += '<div class="search-results-grid">';
      
      results.forEach(article => {
        content += this.createArticleCard(article);
      });
      
      content += '</div>';
    }

    content += '</div>';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);
  }

  displayAllArticlesResults(data) {
    const results = data.articles || [];
    const modal = this.createSearchModal();
    
    let content = `
      <div class="search-modal-header">
        <h2>All Articles</h2>
        <button class="modal-close" onclick="searchManager.closeSearchModal()">&times;</button>
      </div>
      <div class="search-modal-body">
    `;

    if (results.length === 0) {
      content += `
        <div class="no-results">
          <h3>No articles available</h3>
          <p>Please check back later for new content</p>
        </div>
      `;
    } else {
      content += `<div class="search-stats">${results.length} total articles</div>`;
      content += '<div class="search-results-grid">';
      
      results.forEach(article => {
        content += this.createArticleCard(article);
      });
      
      content += '</div>';
    }

    content += '</div>';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);
  }

  createArticleCard(article) {
    const topics = Array.isArray(article.topics) ? article.topics : [];
    const problems = Array.isArray(article.problems_solved) ? article.problems_solved : [];
    const segmentName = article.customer_segment?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    
    return `
      <div class="article-card" data-article-id="${article.id}">
        <div class="article-card-header">
          <div class="article-meta">
            <span class="article-segment">${segmentName}</span>
            <span class="article-priority priority-${article.pain_level || 5}">
              Priority ${article.pain_level || 5}
            </span>
          </div>
          <div class="article-stats">
            <span class="read-time">📖 ${article.read_time || 5} min</span>
            ${article.roi ? `<span class="roi">📈 ${article.roi}</span>` : ''}
          </div>
        </div>
        
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        
        ${topics.length > 0 ? `
          <div class="article-topics">
            ${topics.slice(0, 3).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
          </div>
        ` : ''}
        
        ${problems.length > 0 ? `
          <div class="article-problems">
            <strong>Solves:</strong> ${problems.slice(0, 2).join(', ')}
          </div>
        ` : ''}
        
        <div class="article-actions">
          <button class="btn-read" onclick="searchManager.openArticle('${article.slug}')">
            Read Article
          </button>
          <button class="btn-consult" onclick="searchManager.requestConsultation('${article.slug}')">
            Get Consultation
          </button>
        </div>
      </div>
    `;
  }

  createSearchModal() {
    // Remove existing modal
    this.closeSearchModal();
    
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'searchModal';
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeSearchModal();
      }
    });
    
    return modal;
  }

  async openArticle(articleSlug) {
    try {
      // Track article view
      await fetch('/api/track/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_slug: articleSlug })
      });

      // Navigate to article page
      window.location.href = `/article/${articleSlug}`;
      
    } catch (error) {
      console.error('Error opening article:', error);
      // Fallback: still navigate
      window.location.href = `/article/${articleSlug}`;
    }
  }

  async requestConsultation(articleSlug) {
    try {
      // Track consultation request
      await fetch('/api/track/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_slug: articleSlug })
      });

      // Show consultation modal
      this.showConsultationModal(articleSlug);
      
    } catch (error) {
      console.error('Error tracking consultation:', error);
      // Still show modal
      this.showConsultationModal(articleSlug);
    }
  }

  showConsultationModal(articleSlug) {
    const modal = document.createElement('div');
    modal.className = 'consultation-modal';
    modal.innerHTML = `
      <div class="consultation-modal-content">
        <div class="consultation-modal-header">
          <h3>Request Free Consultation</h3>
          <button class="modal-close" onclick="this.closest('.consultation-modal').remove()">&times;</button>
        </div>
        <div class="consultation-modal-body">
          <p>Our expert design team will help you optimize your space and reduce costs.</p>
          <div class="consultation-options">
            <button class="btn-consultation-phone" onclick="window.location.href='tel:+1-800-WAYFAIR'">
              📞 Call Now: 1-800-WAYFAIR
            </button>
            <button class="btn-consultation-email" onclick="window.location.href='mailto:pro@wayfair.com?subject=Consultation Request'">
              ✉️ Email: pro@wayfair.com
            </button>
            <button class="btn-consultation-form" onclick="window.open('https://www.wayfair.com/v/account/contact_professional_services', '_blank')">
              📋 Online Form
            </button>
          </div>
          <p class="consultation-note">Response within 24 hours • Free assessment • No obligation</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  }

  closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    }
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.search-modal, .consultation-modal, .article-modal');
    modals.forEach(modal => {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    });
  }

  hideSearchResults() {
    this.closeSearchModal();
  }

  showLoadingState() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
      searchButton.textContent = 'Searching...';
      searchButton.disabled = true;
    }
  }

  hideLoadingState() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
      searchButton.textContent = 'Search';
      searchButton.disabled = false;
    }
  }

  showError(message) {
    console.error('Search Error:', message);
    
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'search-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <span>⚠️ ${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Analytics tracking
  trackSearch(query, segment, resultCount) {
    console.log('Search tracked:', { query, segment, resultCount });
    // Implement analytics tracking here
  }

  trackSegmentView(segment, articleCount) {
    console.log('Segment view tracked:', { segment, articleCount });
  }

  trackSegmentInteraction(segment) {
    console.log('Analytics Event:', { 
      event: 'segment_hover', 
      segment 
    });
  }

  trackAllArticlesView(articleCount) {
    console.log('All articles view tracked:', { articleCount });
  }

  trackArticleView(articleId) {
    console.log('Article view tracked:', { articleId });
  }

  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize search manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new DatabaseSearchManager();
});

// Legacy compatibility - some HTML might still reference these
window.performSearch = (query) => {
  if (window.searchManager) {
    window.searchManager.performSearch(query);
  }
};

window.showAllArticles = () => {
  if (window.searchManager) {
    window.searchManager.showAllArticles();
  }
}; 