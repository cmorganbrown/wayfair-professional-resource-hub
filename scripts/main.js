// Main Application - Wayfair Professional Resource Hub
// Handles page initialization, navigation, and general interactions

class WayfairResourceHub {
  constructor() {
    this.featuredArticlesContainer = document.getElementById('featuredArticles');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.navList = document.querySelector('.nav-list');
    
    this.init();
  }
  
  init() {
    // Load featured articles on homepage
    if (this.featuredArticlesContainer) {
      this.loadFeaturedArticles();
    }
    
    // Setup navigation
    this.setupNavigation();
    
    // Setup customer segment interactions
    this.setupSegmentCards();
    
    // Setup topic cards
    this.setupTopicCards();
    
    // Setup mobile menu
    this.setupMobileMenu();
    
    // Setup smooth scrolling
    this.setupSmoothScrolling();
    
    // Setup consultation CTAs
    this.setupConsultationCTAs();
    
    // Initialize analytics tracking
    this.initAnalytics();
  }
  
  loadFeaturedArticles() {
    const featuredArticles = articlesData.getFeaturedArticles(5);
    
    if (featuredArticles.length === 0) {
      this.featuredArticlesContainer.innerHTML = `
        <div class="no-articles">
          <p>Featured articles are being prepared. Check back soon!</p>
        </div>
      `;
      return;
    }
    
    this.featuredArticlesContainer.innerHTML = '';
    
    featuredArticles.forEach(article => {
      const articleCard = this.createFeaturedArticleCard(article);
      this.featuredArticlesContainer.appendChild(articleCard);
    });
  }
  
  createFeaturedArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.setAttribute('data-article-id', article.id);
    
    // Determine priority level styling
    const priorityClass = article.painLevel >= 8 ? 'high-priority' : 'medium-priority';
    
    // Format customer segment
    const segmentName = articlesData.searchIndex.customerSegments[article.customerSegment];
    
    card.innerHTML = `
      <div class="article-meta">
        <span class="article-category ${priorityClass}">${segmentName}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        
        <div class="article-metrics">
          <div class="metric">
            <span class="metric-icon">💰</span>
            <span class="metric-text">${article.roi}</span>
          </div>
          <div class="metric">
            <span class="metric-icon">⏱️</span>
            <span class="metric-text">${article.readTime} min read</span>
          </div>
          <div class="metric">
            <span class="metric-icon">🎯</span>
            <span class="metric-text">Priority ${article.painLevel}/9</span>
          </div>
        </div>
        
        <div class="article-problems">
          <strong>Solves:</strong>
          <ul>
            ${article.problemsSolved.slice(0, 3).map(problem => `<li>${problem}</li>`).join('')}
            ${article.problemsSolved.length > 3 ? '<li>+ more...</li>' : ''}
          </ul>
        </div>
        
        <div class="article-actions">
          <button class="article-cta" onclick="app.openArticle('${article.id}')">
            Read Full Article →
          </button>
          <button class="consultation-cta" onclick="app.requestConsultation('${article.id}')">
            Get Free Consultation
          </button>
        </div>
      </div>
    `;
    
    return card;
  }
  
  setupNavigation() {
    // Highlight active navigation items based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    window.addEventListener('scroll', () => {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 60) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }
  
  setupSegmentCards() {
    const segmentCards = document.querySelectorAll('.segment-card');
    
    segmentCards.forEach(card => {
      card.addEventListener('click', () => {
        const segment = card.getAttribute('data-segment');
        this.showSegmentArticles(segment);
      });
      
      // Add hover analytics
      card.addEventListener('mouseenter', () => {
        const segment = card.getAttribute('data-segment');
        this.trackEvent('segment_hover', { segment });
      });
    });
  }
  
  setupTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
      card.addEventListener('click', () => {
        const topic = card.getAttribute('data-topic');
        this.showTopicArticles(topic);
      });
      
      // Add hover analytics
      card.addEventListener('mouseenter', () => {
        const topic = card.getAttribute('data-topic');
        this.trackEvent('topic_hover', { topic });
      });
    });
  }
  
  setupMobileMenu() {
    if (this.mobileMenuToggle && this.navList) {
      this.mobileMenuToggle.addEventListener('click', () => {
        this.navList.classList.toggle('mobile-open');
        this.mobileMenuToggle.classList.toggle('active');
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.mobileMenuToggle.contains(e.target) && !this.navList.contains(e.target)) {
          this.navList.classList.remove('mobile-open');
          this.mobileMenuToggle.classList.remove('active');
        }
      });
    }
  }
  
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Track navigation
          this.trackEvent('navigation_click', { target: targetId });
        }
      });
    });
  }
  
  setupConsultationCTAs() {
    const consultationBtns = document.querySelectorAll('a[href="#consultation"], .btn[href="#consultation"]');
    
    consultationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openConsultationModal();
      });
    });
  }
  
  showSegmentArticles(segment) {
    const articles = articlesData.getArticlesBySegment(segment);
    const segmentName = articlesData.searchIndex.customerSegments[segment];
    
    console.log(`Showing articles for segment: ${segment} (${segmentName})`);
    console.log(`Found ${articles.length} articles for this segment`);
    
    // Use search interface to show results
    if (window.searchManager) {
      console.log('SearchManager available, filtering by segment');
      searchManager.filterBySegment(segment);
    } else {
      console.log('SearchManager not available, waiting for initialization');
      // Wait a bit for searchManager to initialize
      setTimeout(() => {
        if (window.searchManager) {
          searchManager.filterBySegment(segment);
        } else {
          console.error('SearchManager still not available after timeout');
        }
      }, 100);
    }
    
    this.trackEvent('segment_click', { segment, articleCount: articles.length });
  }
  
  showTopicArticles(topic) {
    const articles = articlesData.getArticlesByTopic(topic);
    const topicName = articlesData.searchIndex.topics[topic];
    
    // Trigger search with topic
    if (window.searchManager) {
      searchManager.searchInput.value = topicName;
      searchManager.performSearch();
    }
    
    this.trackEvent('topic_click', { topic, articleCount: articles.length });
  }
  
  openArticle(articleId) {
    const article = articlesData.getArticleById(articleId);
    if (!article) return;
    
    // In a real implementation, this would navigate to a dedicated article page
    // For now, we'll show a modal with the article content
    this.showArticleModal(article);
    
    this.trackEvent('article_open', { 
      articleId, 
      title: article.title,
      segment: article.customerSegment,
      painLevel: article.painLevel
    });
  }
  
  showArticleModal(article) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
      <div class="article-modal-content">
        <div class="article-modal-header">
          <h1>${article.title}</h1>
          <button class="close-modal" onclick="app.closeArticleModal()">&times;</button>
        </div>
        <div class="article-modal-body">
          <div class="article-content">
            ${article.content}
          </div>
          <div class="article-sidebar">
            <div class="article-info">
              <h4>Quick Info</h4>
              <ul>
                <li><strong>ROI:</strong> ${article.roi}</li>
                <li><strong>Read Time:</strong> ${article.readTime} minutes</li>
                <li><strong>Priority:</strong> ${article.painLevel}/9</li>
                <li><strong>Segment:</strong> ${articlesData.searchIndex.customerSegments[article.customerSegment]}</li>
              </ul>
            </div>
            <div class="related-articles">
              <h4>Related Solutions</h4>
              ${this.getRelatedArticlesHTML(article)}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 50);
  }
  
  closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      }, 300);
    }
  }
  
  getRelatedArticlesHTML(currentArticle) {
    // Find articles with similar topics or same segment
    const related = articlesData.getAllArticles()
      .filter(article => 
        article.id !== currentArticle.id && 
        (article.customerSegment === currentArticle.customerSegment ||
         article.topics.some(topic => currentArticle.topics.includes(topic)))
      )
      .slice(0, 3);
    
    if (related.length === 0) {
      return '<p>No related articles found.</p>';
    }
    
    return related.map(article => `
      <div class="related-article" onclick="app.openArticle('${article.id}')">
        <h5>${article.title}</h5>
        <p>${article.excerpt.substring(0, 100)}...</p>
      </div>
    `).join('');
  }
  
  requestConsultation(articleId = null) {
    const article = articleId ? articlesData.getArticleById(articleId) : null;
    
    this.openConsultationModal(article);
    
    this.trackEvent('consultation_request', { 
      articleId: articleId || 'general',
      source: articleId ? 'article' : 'general'
    });
  }
  
  openConsultationModal(article = null) {
    // Create consultation modal
    const modal = document.createElement('div');
    modal.className = 'consultation-modal';
    
    const contextText = article ? 
      `I'm interested in learning more about "${article.title}" and how it applies to my business.` :
      `I'd like to discuss my commercial furniture needs.`;
    
    modal.innerHTML = `
      <div class="consultation-modal-content">
        <div class="consultation-modal-header">
          <h2>Schedule Free Consultation</h2>
          <button class="close-modal" onclick="app.closeConsultationModal()">&times;</button>
        </div>
        <div class="consultation-modal-body">
          <p>Get personalized recommendations from Wayfair Professional specialists.</p>
          <form class="consultation-form" onsubmit="app.submitConsultationForm(event)">
            <div class="form-group">
              <label for="consultName">Name *</label>
              <input type="text" id="consultName" required>
            </div>
            <div class="form-group">
              <label for="consultEmail">Email *</label>
              <input type="email" id="consultEmail" required>
            </div>
            <div class="form-group">
              <label for="consultPhone">Phone</label>
              <input type="tel" id="consultPhone">
            </div>
            <div class="form-group">
              <label for="consultCompany">Company</label>
              <input type="text" id="consultCompany">
            </div>
            <div class="form-group">
              <label for="consultMessage">How can we help? *</label>
              <textarea id="consultMessage" rows="4" required>${contextText}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Request Consultation</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 50);
  }
  
  closeConsultationModal() {
    const modal = document.querySelector('.consultation-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      }, 300);
    }
  }
  
  submitConsultationForm(event) {
    event.preventDefault();
    
    const formData = {
      name: document.getElementById('consultName').value,
      email: document.getElementById('consultEmail').value,
      phone: document.getElementById('consultPhone').value,
      company: document.getElementById('consultCompany').value,
      message: document.getElementById('consultMessage').value
    };
    
    // In a real implementation, this would send to a backend service
    console.log('Consultation request:', formData);
    
    // Show success message
    alert('Thank you! A Wayfair Professional specialist will contact you within 24 hours.');
    
    this.closeConsultationModal();
    
    this.trackEvent('consultation_submitted', { 
      hasPhone: !!formData.phone,
      hasCompany: !!formData.company
    });
  }
  
  initAnalytics() {
    // Track page view
    this.trackEvent('page_view', {
      page: 'homepage',
      timestamp: new Date().toISOString()
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll_depth', { percent: maxScroll });
        }
      }
    });
  }
  
  trackEvent(eventName, properties = {}) {
    // In a real implementation, this would send to analytics service
    console.log('Analytics Event:', eventName, properties);
    
    // Example integration with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
  }
}

// Utility functions
const utils = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  },
  
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
  },
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new WayfairResourceHub();
});

// Handle offline/online status
window.addEventListener('online', () => {
  console.log('Connection restored');
  // Could show notification to user
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  // Could show offline notification
});

// Performance monitoring
window.addEventListener('load', () => {
  // Track page load performance
  if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
    
    if (app) {
      app.trackEvent('performance', { loadTime });
    }
  }
}); 