// Search Functionality - Wayfair Professional Resource Hub
// Handles search interface, filtering, and results display

class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
    this.customerFilter = document.getElementById('customerFilter');
    this.painLevelFilter = document.getElementById('painLevelFilter');
    this.searchResults = document.getElementById('searchResults');
    this.searchResultsBody = document.getElementById('searchResultsBody');
    this.closeResults = document.getElementById('closeResults');
    
    this.debounceTimer = null;
    this.debounceDelay = 300; // milliseconds
    
    this.init();
  }
  
  init() {
    // Event listeners
    this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    this.customerFilter.addEventListener('change', this.handleFilterChange.bind(this));
    this.painLevelFilter.addEventListener('change', this.handleFilterChange.bind(this));
    this.closeResults.addEventListener('click', this.hideResults.bind(this));
    
    // Close results when clicking outside
    this.searchResults.addEventListener('click', (e) => {
      if (e.target === this.searchResults) {
        this.hideResults();
      }
    });
    
    // Handle Enter key in search
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSearch();
      }
    });
    
    // ESC key to close results
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResults();
      }
    });
  }
  
  handleSearchInput() {
    // Debounce search to avoid excessive queries
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const query = this.searchInput.value.trim();
      if (query.length >= 2) {
        this.performSearch();
      } else if (query.length === 0) {
        this.hideResults();
      }
    }, this.debounceDelay);
  }
  
  handleSearch() {
    const query = this.searchInput.value.trim();
    if (query) {
      this.performSearch();
    }
  }
  
  handleFilterChange() {
    // If there's a search query or active filters, perform search
    const query = this.searchInput.value.trim();
    const hasFilters = this.customerFilter.value || this.painLevelFilter.value;
    
    if (query || hasFilters) {
      this.performSearch();
    }
  }
  
  performSearch() {
    const query = this.searchInput.value.trim();
    const filters = {
      customerSegment: this.customerFilter.value || null,
      painLevel: this.painLevelFilter.value || null
    };
    
    const results = articlesData.searchArticles(query, filters);
    this.displayResults(results, query, filters);
  }
  
  displayResults(results, query, filters) {
    // Clear previous results
    this.searchResultsBody.innerHTML = '';
    
    if (results.length === 0) {
      this.showNoResults(query, filters);
      return;
    }
    
    // Create results header
    const header = this.createResultsHeader(results.length, query, filters);
    this.searchResultsBody.appendChild(header);
    
    // Create article cards
    results.forEach(article => {
      const card = this.createArticleCard(article);
      this.searchResultsBody.appendChild(card);
    });
    
    this.showResults();
  }
  
  createResultsHeader(count, query, filters) {
    const header = document.createElement('div');
    header.className = 'search-results-summary';
    
    let summaryText = `${count} article${count !== 1 ? 's' : ''} found`;
    
    if (query) {
      summaryText += ` for "${query}"`;
    }
    
    if (filters.customerSegment) {
      const segmentName = articlesData.searchIndex.customerSegments[filters.customerSegment];
      summaryText += ` in ${segmentName}`;
    }
    
    if (filters.painLevel) {
      const levelName = articlesData.searchIndex.painLevels[filters.painLevel].label;
      summaryText += ` (${levelName})`;
    }
    
    header.innerHTML = `
      <div class="results-summary">
        <h4>${summaryText}</h4>
        <button class="clear-search" onclick="searchManager.clearSearch()">
          Clear Search
        </button>
      </div>
    `;
    
    return header;
  }
  
  createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    
    // Format topics
    const topicTags = article.topics.map(topic => {
      const topicName = articlesData.searchIndex.topics[topic];
      return `<span class="topic-tag">${topicName}</span>`;
    }).join('');
    
    // Format customer segment
    const segmentName = articlesData.searchIndex.customerSegments[article.customerSegment];
    
    // Pain level indicator
    const painLevelClass = article.painLevel >= 8 ? 'high' : article.painLevel >= 6 ? 'medium' : 'standard';
    
    card.innerHTML = `
      <div class="search-result-content">
        <div class="search-result-meta">
          <span class="search-result-category">${segmentName}</span>
          <span class="pain-level-indicator ${painLevelClass}">
            Priority: ${article.painLevel}/9
          </span>
        </div>
        
        <h3 class="search-result-title">${article.title}</h3>
        
        <p class="search-result-excerpt">${article.excerpt}</p>
        
        <div class="search-result-metrics">
          <div class="metric">
            <span class="metric-label">ROI:</span>
            <span class="metric-value">${article.roi}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Read Time:</span>
            <span class="metric-value">${article.readTime} min</span>
          </div>
        </div>
        
        <div class="search-result-topics">
          ${topicTags}
        </div>
        
        <div class="search-result-actions">
          <button class="btn-read-article" onclick="searchManager.openArticle('${article.id}')">
            Read Article →
          </button>
          <button class="btn-get-consultation" onclick="searchManager.requestConsultation('${article.id}')">
            Get Free Consultation
          </button>
        </div>
      </div>
    `;
    
    return card;
  }
  
  showNoResults(query, filters) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    
    let message = 'No articles found';
    if (query) {
      message += ` for "${query}"`;
    }
    
    noResults.innerHTML = `
      <div class="no-results-content">
        <h4>${message}</h4>
        <p>Try adjusting your search terms or filters, or browse by customer segment:</p>
        <div class="suggested-segments">
          ${Object.entries(articlesData.searchIndex.customerSegments).map(([key, name]) => 
            `<button class="segment-suggestion" onclick="searchManager.filterBySegment('${key}')">${name}</button>`
          ).join('')}
        </div>
        <p class="contact-suggestion">
          Can't find what you're looking for? 
          <a href="#consultation" class="contact-link">Contact our specialists</a> 
          for personalized recommendations.
        </p>
      </div>
    `;
    
    this.searchResultsBody.appendChild(noResults);
    this.showResults();
  }
  
  showResults() {
    this.searchResults.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  hideResults() {
    this.searchResults.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.customerFilter.value = '';
    this.painLevelFilter.value = '';
    this.hideResults();
  }
  
  filterBySegment(segment) {
    this.customerFilter.value = segment;
    this.searchInput.value = '';
    this.performSearch();
  }
  
  openArticle(articleId) {
    const article = articlesData.getArticleById(articleId);
    if (article) {
      // Use the main app's article modal functionality
      if (window.app) {
        window.app.openArticle(articleId);
      } else {
        // Fallback: create a basic modal with available content
        this.createBasicArticleModal(article);
      }
      
      // Track the interaction (for analytics)
      this.trackArticleView(articleId);
    }
  }

  createBasicArticleModal(article) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
      <div class="article-modal-content">
        <div class="article-modal-header">
          <h1>${article.title}</h1>
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove(); document.body.style.overflow = '';">&times;</button>
        </div>
        <div class="article-modal-body">
          <div class="article-content">
            <div class="article-meta-info">
              <div class="article-segment">
                <strong>Target Audience:</strong> ${articlesData.searchIndex.customerSegments[article.customerSegment]}
              </div>
              <div class="article-metrics">
                <span><strong>ROI:</strong> ${article.roi}</span>
                <span><strong>Read Time:</strong> ${article.readTime} minutes</span>
                <span><strong>Priority Level:</strong> ${article.painLevel}/9</span>
              </div>
            </div>
            
            <div class="article-excerpt">
              <h3>Overview</h3>
              <p>${article.excerpt}</p>
            </div>
            
            <div class="article-problems">
              <h3>Problems This Article Solves</h3>
              <ul>
                ${article.problemsSolved.map(problem => `<li>${problem}</li>`).join('')}
              </ul>
            </div>
            
            <div class="wayfair-solutions">
              <h3>Wayfair Professional Solutions</h3>
              <ul>
                ${article.wayfairSolutions.map(solution => `<li>${solution}</li>`).join('')}
              </ul>
            </div>
            
            ${article.content ? `<div class="full-content">${article.content}</div>` : ''}
            
            <div class="cta-section">
              <h4>Ready to Transform Your Space?</h4>
              <p>Get personalized recommendations from Wayfair Professional specialists.</p>
              <div class="cta-buttons">
                <button class="btn-consultation" onclick="searchManager.requestConsultation('${article.id}')">
                  Get Free Consultation
                </button>
                <a href="https://www.wayfair.com/professional/" class="btn-products" target="_blank">
                  Browse Solutions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 50);
    
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }
    });
  }

  requestConsultation(articleId) {
    const article = articlesData.getArticleById(articleId);
    if (article) {
      // Use main app consultation functionality if available
      if (window.app) {
        window.app.requestConsultation(articleId);
      } else {
        // Fallback: show consultation modal
        this.showConsultationForm(article);
      }
      
      // Track the interaction (for analytics)
      this.trackConsultationRequest(articleId);
    }
  }

  showConsultationForm(article) {
    // Create consultation modal
    const modal = document.createElement('div');
    modal.className = 'consultation-modal';
    modal.innerHTML = `
      <div class="consultation-modal-content">
        <div class="consultation-modal-header">
          <h2>Request Free Consultation</h2>
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove(); document.body.style.overflow = '';">&times;</button>
        </div>
        <div class="consultation-modal-body">
          <div class="consultation-info">
            <h3>Get Expert Guidance for: ${article.title}</h3>
            <p>Our Wayfair Professional specialists will provide personalized recommendations for your ${articlesData.searchIndex.customerSegments[article.customerSegment]} needs.</p>
          </div>
          <div class="consultation-contact">
            <div class="contact-option">
              <h4>📞 Call Now</h4>
              <p><a href="tel:1-855-339-0297">1-855-339-0297</a></p>
              <small>Monday-Friday, 8AM-8PM EST</small>
            </div>
            <div class="contact-option">
              <h4>📧 Email</h4>
              <p><a href="mailto:professional@wayfair.com">professional@wayfair.com</a></p>
              <small>Response within 24 hours</small>
            </div>
            <div class="contact-option">
              <h4>🌐 Online</h4>
              <p><a href="https://www.wayfair.com/professional/" target="_blank">Visit Wayfair Professional</a></p>
              <small>Browse solutions and request consultation</small>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close functionality
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }
    });
  }

  // Add method to show all articles
  showAllArticles() {
    // Clear any existing search and show all articles
    this.searchInput.value = '';
    this.customerFilter.value = '';
    this.painLevelFilter.value = '';
    
    const allArticles = articlesData.getAllArticles();
    this.displayResults(allArticles, '', {});
  }
  
  trackArticleView(articleId) {
    // Analytics tracking would go here
    console.log(`Article viewed: ${articleId}`);
  }
  
  trackConsultationRequest(articleId) {
    // Analytics tracking would go here
    console.log(`Consultation requested for article: ${articleId}`);
  }
}

// Advanced search features
class AdvancedSearch {
  static performFacetedSearch(facets) {
    // facets = { topics: ['cost-optimization'], segments: ['interior-designers'], painLevel: 'high' }
    let results = articlesData.getAllArticles();
    
    if (facets.topics && facets.topics.length > 0) {
      results = results.filter(article => 
        facets.topics.some(topic => article.topics.includes(topic))
      );
    }
    
    if (facets.segments && facets.segments.length > 0) {
      results = results.filter(article => 
        facets.segments.includes(article.customerSegment)
      );
    }
    
    if (facets.painLevel) {
      const range = articlesData.searchIndex.painLevels[facets.painLevel];
      if (range) {
        results = results.filter(article => 
          article.painLevel >= range.min && article.painLevel <= range.max
        );
      }
    }
    
    return results;
  }
  
  static getSearchSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Topic suggestions
    Object.entries(articlesData.searchIndex.topics).forEach(([key, name]) => {
      if (name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({ type: 'topic', key, name, query: name });
      }
    });
    
    // Customer segment suggestions
    Object.entries(articlesData.searchIndex.customerSegments).forEach(([key, name]) => {
      if (name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({ type: 'segment', key, name, query: name });
      }
    });
    
    // Problem-based suggestions
    articlesData.getAllArticles().forEach(article => {
      article.problemsSolved.forEach(problem => {
        if (problem.toLowerCase().includes(lowerQuery)) {
          suggestions.push({ 
            type: 'problem', 
            key: article.id, 
            name: problem, 
            query: problem,
            article: article.title
          });
        }
      });
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }
}

// Quick search functionality for homepage
class QuickSearch {
  static searchByTopic(topic) {
    const results = articlesData.getArticlesByTopic(topic);
    return results;
  }
  
  static searchBySegment(segment) {
    const results = articlesData.getArticlesBySegment(segment);
    return results;
  }
  
  static getFeaturedBySegment(segment, limit = 3) {
    const results = articlesData.getArticlesBySegment(segment);
    return results.slice(0, limit);
  }
}

// Initialize search manager when DOM is loaded
let searchManager;
document.addEventListener('DOMContentLoaded', () => {
  searchManager = new SearchManager();
  window.searchManager = searchManager; // Make globally available
  console.log('SearchManager initialized and available globally');
}); 