const fs = require('fs');
const path = require('path');

// Article parsing and database generation script
class ArticlesDatabaseGenerator {
  constructor() {
    this.articlesDir = path.join(__dirname, '..', 'articles');
    this.outputFile = path.join(__dirname, 'articles-data.js');
    
    // Customer segment mapping from filenames
    this.segmentMapping = {
      'interior_designers': 'interior-designers',
      'interior-designers': 'interior-designers',
      'contractors': 'contractors',
      'office_procurement': 'office-procurement',
      'accommodations': 'accommodations',
      'education': 'education',
      'foodservice': 'foodservice',
      'property_management': 'property-management',
      'tier1': 'tier1', // General commercial
      'article': 'tier1' // General articles
    };
    
    // Topic extraction keywords
    this.topicKeywords = {
      'cost-optimization': ['cost', 'savings', 'budget', 'roi', 'pricing', 'optimization', 'efficiency'],
      'space-planning': ['space', 'planning', 'layout', 'design', 'workspace', 'area'],
      'workflow-efficiency': ['workflow', 'productivity', 'efficiency', 'process', 'management'],
      'compliance': ['compliance', 'safety', 'regulation', 'standard', 'requirement'],
      'technology': ['technology', 'digital', 'automation', 'software', 'smart'],
      'durability': ['durability', 'maintenance', 'quality', 'longevity', 'reliability']
    };
  }
  
  // Parse a single markdown file
  parseArticle(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath, '.md');
      
      // Extract title (first # heading)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : this.generateTitleFromFilename(filename);
      
      // Extract customer segment from filename
      const customerSegment = this.extractCustomerSegment(filename);
      
      // Extract excerpt (look for executive summary or first paragraph)
      const excerpt = this.extractExcerpt(content);
      
      // Determine pain level based on filename and content
      const painLevel = this.determinePainLevel(filename, content);
      
      // Extract topics based on content analysis
      const topics = this.extractTopics(content, title);
      
      // Estimate read time based on content length
      const readTime = this.estimateReadTime(content);
      
      // Generate slug from title
      const slug = this.generateSlug(title);
      
      // Extract problems and solutions
      const problemsSolved = this.extractProblems(content);
      const wayfairSolutions = this.extractSolutions(content);
      
      // Generate ROI statement
      const roi = this.generateROI(content, painLevel);
      
      return {
        id: this.generateId(filename),
        title: title,
        slug: slug,
        category: this.getCategory(customerSegment),
        customerSegment: customerSegment,
        painLevel: painLevel,
        topics: topics,
        excerpt: excerpt,
        readTime: readTime,
        publishDate: "2024-01-15", // Default date, could be extracted from file metadata
        roi: roi,
        problemsSolved: problemsSolved,
        wayfairSolutions: wayfairSolutions,
        metrics: {
          potentialSavings: this.extractSavings(content),
          implementationTime: this.extractImplementationTime(content),
          roiTimeframe: this.extractROITimeframe(content)
        }
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
      return null;
    }
  }
  
  // Extract customer segment from filename
  extractCustomerSegment(filename) {
    for (const [key, segment] of Object.entries(this.segmentMapping)) {
      if (filename.toLowerCase().includes(key)) {
        return segment;
      }
    }
    return 'tier1'; // Default to general
  }
  
  // Extract excerpt from content
  extractExcerpt(content) {
    // Look for executive summary
    const execSummaryMatch = content.match(/## Executive Summary\s*\n\n(.+?)(?=\n\n|\n##)/s);
    if (execSummaryMatch) {
      return this.cleanExcerpt(execSummaryMatch[1]);
    }
    
    // Look for first paragraph after title
    const firstParaMatch = content.match(/^#.+?\n\n(.+?)(?=\n\n|\n##)/s);
    if (firstParaMatch) {
      return this.cleanExcerpt(firstParaMatch[1]);
    }
    
    // Fallback to first 200 characters
    const cleanContent = content.replace(/^#.+?\n/, '').trim();
    return this.cleanExcerpt(cleanContent.substring(0, 200) + '...');
  }
  
  // Clean excerpt text
  cleanExcerpt(text) {
    return text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 300); // Limit length
  }
  
  // Determine pain level based on content and filename
  determinePainLevel(filename, content) {
    // Tier 1 articles are high priority
    if (filename.includes('tier1')) {
      return 8;
    }
    
    // Look for urgency indicators in content
    const urgencyKeywords = ['crisis', 'critical', 'urgent', 'disaster', 'emergency', 'breakthrough'];
    const costKeywords = ['million', 'billion', 'save', 'savings', 'reduce costs'];
    
    const hasUrgency = urgencyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    const hasCostImpact = costKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasUrgency || hasCostImpact) {
      return 8;
    }
    
    // Default pain levels by segment
    const segmentPainLevels = {
      'interior-designers': 7,
      'contractors': 7,
      'office-procurement': 6,
      'accommodations': 6,
      'education': 6,
      'foodservice': 6,
      'property-management': 5
    };
    
    const segment = this.extractCustomerSegment(filename);
    return segmentPainLevels[segment] || 6;
  }
  
  // Extract topics based on content analysis
  extractTopics(content, title) {
    const topics = [];
    const textToAnalyze = (title + ' ' + content).toLowerCase();
    
    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      const keywordCount = keywords.reduce((count, keyword) => {
        return count + (textToAnalyze.split(keyword.toLowerCase()).length - 1);
      }, 0);
      
      if (keywordCount >= 3) { // Threshold for topic relevance
        topics.push(topic);
      }
    }
    
    // Ensure at least 2 topics
    if (topics.length === 0) {
      topics.push('workflow-efficiency', 'cost-optimization');
    } else if (topics.length === 1) {
      topics.push('workflow-efficiency');
    }
    
    return topics.slice(0, 3); // Limit to 3 topics
  }
  
  // Estimate read time based on content
  estimateReadTime(content) {
    const wordCount = content.split(/\s+/).length;
    const wordsPerMinute = 200; // Average reading speed
    return Math.max(5, Math.ceil(wordCount / wordsPerMinute));
  }
  
  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Generate ID from filename
  generateId(filename) {
    return filename.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  }
  
  // Get category from customer segment
  getCategory(customerSegment) {
    const categoryMap = {
      'interior-designers': 'Interior Designers',
      'contractors': 'Contractors',
      'office-procurement': 'Office Procurement',
      'accommodations': 'Accommodations',
      'education': 'Education',
      'foodservice': 'Foodservice',
      'property-management': 'Property Management',
      'tier1': 'Commercial Solutions'
    };
    return categoryMap[customerSegment] || 'General';
  }
  
  // Extract problems from content
  extractProblems(content) {
    const problems = [];
    
    // Look for problem patterns
    const problemPatterns = [
      /problems?[:\s]+(.+?)(?=\n|\.|,)/gi,
      /challenges?[:\s]+(.+?)(?=\n|\.|,)/gi,
      /issues?[:\s]+(.+?)(?=\n|\.|,)/gi,
      /concerns?[:\s]+(.+?)(?=\n|\.|,)/gi
    ];
    
    problemPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 10) {
          problems.push(match[1].trim());
        }
      }
    });
    
    // Default problems based on content analysis
    if (problems.length === 0) {
      if (content.includes('cost')) problems.push('Cost management challenges');
      if (content.includes('efficiency')) problems.push('Operational inefficiency');
      if (content.includes('productivity')) problems.push('Productivity concerns');
      if (content.includes('compliance')) problems.push('Compliance requirements');
    }
    
    return problems.slice(0, 4); // Limit to 4 problems
  }
  
  // Extract Wayfair solutions from content
  extractSolutions(content) {
    const solutions = [
      'Professional consultation services',
      'Volume pricing and bulk discounts',
      'Dedicated account management',
      'Expert installation services'
    ];
    
    // Add specific solutions based on content
    if (content.includes('furniture')) solutions.unshift('Commercial-grade furniture solutions');
    if (content.includes('design')) solutions.unshift('Professional design services');
    if (content.includes('technology')) solutions.unshift('Technology integration support');
    
    return solutions.slice(0, 4);
  }
  
  // Generate ROI statement
  generateROI(content, painLevel) {
    const roiPatterns = [
      /save[sd]?\s+[\$]?(\d+[%k-\d\s,]+)/gi,
      /reduc[ed]+\s+.+?by\s+(\d+[%k-\d\s,]+)/gi,
      /improv[ed]+\s+.+?by\s+(\d+[%k-\d\s,]+)/gi
    ];
    
    for (const pattern of roiPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].replace(/save[sd]?|reduc[ed]+|improv[ed]+/gi, '').trim();
      }
    }
    
    // Default ROI based on pain level
    const defaultROI = {
      9: '40-60% cost reduction',
      8: '25-40% efficiency improvement', 
      7: '20-30% productivity gain',
      6: '15-25% optimization',
      5: '10-20% improvement'
    };
    
    return defaultROI[painLevel] || '15-25% performance improvement';
  }
  
  // Extract savings information
  extractSavings(content) {
    const savingsMatch = content.match(/\$[\d,]+[-\s]*[\d,]*\s*(?:annually|per year|savings)/i);
    return savingsMatch ? savingsMatch[0] : '$10,000-50,000 annually';
  }
  
  // Extract implementation time
  extractImplementationTime(content) {
    const timeMatch = content.match(/(\d+[-\s]*\d*)\s*(?:weeks?|months?|days?)\s*(?:implementation|to implement)/i);
    return timeMatch ? timeMatch[0] : '2-4 weeks';
  }
  
  // Extract ROI timeframe
  extractROITimeframe(content) {
    const roiMatch = content.match(/ROI.{0,20}(\d+[-\s]*\d*)\s*(?:months?|years?)/i);
    return roiMatch ? roiMatch[1] + ' months' : '6-12 months';
  }
  
  // Generate title from filename if needed
  generateTitleFromFilename(filename) {
    return filename
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\d+/g, '');
  }
  
  // Main generation function
  async generateDatabase() {
    try {
      console.log('🔍 Scanning articles directory...');
      
      // Get all markdown files
      const files = fs.readdirSync(this.articlesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(this.articlesDir, file));
      
      console.log(`📄 Found ${files.length} articles to process`);
      
      // Parse all articles
      const articles = [];
      let processed = 0;
      
      for (const file of files) {
        const article = this.parseArticle(file);
        if (article) {
          articles.push(article);
          processed++;
          console.log(`✅ Processed: ${article.title} (${processed}/${files.length})`);
        }
      }
      
      console.log(`📊 Successfully processed ${processed} articles`);
      
      // Organize articles by tier/category
      const tier1Articles = articles.filter(a => a.customerSegment === 'tier1' || a.painLevel >= 8);
      const otherArticles = articles.filter(a => a.customerSegment !== 'tier1' && a.painLevel < 8);
      
      // Generate the articles-data.js content
      const databaseContent = this.generateDatabaseFile(tier1Articles, otherArticles);
      
      // Write to file
      fs.writeFileSync(this.outputFile, databaseContent, 'utf8');
      
      console.log('🎉 Articles database generated successfully!');
      console.log(`📁 Output: ${this.outputFile}`);
      console.log(`📈 Stats: ${tier1Articles.length} tier1 articles, ${otherArticles.length} other articles`);
      
      return {
        success: true,
        totalArticles: articles.length,
        tier1Count: tier1Articles.length,
        otherCount: otherArticles.length
      };
      
    } catch (error) {
      console.error('❌ Error generating database:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Generate the complete articles-data.js file content
  generateDatabaseFile(tier1Articles, otherArticles) {
    const content = `// Articles Database - Wayfair Professional Resource Hub
// Auto-generated from markdown files - DO NOT EDIT MANUALLY
// Use 'node scripts/generate-articles-database.js' to regenerate

const articlesData = {
  // Tier 1 High-Impact Articles (Pain Level 8-9)
  tier1: [
${tier1Articles.map(article => this.formatArticleObject(article)).join(',\n')}
  ],

  // Other Articles (Tier 2 & 3)
  tier2: [
${otherArticles.map(article => this.formatArticleObject(article)).join(',\n')}
  ],

  // Tier 3 articles (future expansion)
  tier3: [],

  // Article metadata for search and filtering
  searchIndex: {
    customerSegments: {
      "interior-designers": "Interior Designers",
      "contractors": "Contractors", 
      "office-procurement": "Office Procurement",
      "accommodations": "Accommodations",
      "education": "Education",
      "foodservice": "Foodservice",
      "property-management": "Property Management",
      "tier1": "Commercial Solutions"
    },
    
    topics: {
      "cost-optimization": "Cost Optimization",
      "space-planning": "Space Planning", 
      "workflow-efficiency": "Workflow Efficiency",
      "compliance": "Compliance & Safety",
      "technology": "Technology Integration",
      "durability": "Durability & Maintenance"
    },
    
    painLevels: {
      "high": { min: 8, max: 9, label: "High Impact (8-9)" },
      "medium": { min: 6, max: 7, label: "Medium Impact (6-7)" },
      "standard": { min: 4, max: 5, label: "Standard (4-5)" }
    }
  },

  // Helper methods
  getAllArticles() {
    return [...this.tier1, ...this.tier2, ...this.tier3];
  },

  getArticlesBySegment(segment) {
    return this.getAllArticles().filter(article => article.customerSegment === segment);
  },

  getArticlesByTopic(topic) {
    return this.getAllArticles().filter(article => article.topics.includes(topic));
  },

  getArticlesByPainLevel(level) {
    const range = this.searchIndex.painLevels[level];
    if (!range) return [];
    return this.getAllArticles().filter(article => 
      article.painLevel >= range.min && article.painLevel <= range.max
    );
  },

  searchArticles(query, filters = {}) {
    let results = this.getAllArticles();
    console.log(\`Starting search with query: "\${query}", filters:\`, filters);
    console.log(\`Total articles available: \${results.length}\`);
    
    // Filter by customer segment
    if (filters.customerSegment) {
      results = results.filter(article => article.customerSegment === filters.customerSegment);
      console.log(\`After customer segment filter (\${filters.customerSegment}): \${results.length} articles\`);
    }
    
    // Filter by pain level
    if (filters.painLevel) {
      const range = this.searchIndex.painLevels[filters.painLevel];
      if (range) {
        results = results.filter(article => 
          article.painLevel >= range.min && article.painLevel <= range.max
        );
        console.log(\`After pain level filter (\${filters.painLevel}): \${results.length} articles\`);
      }
    }
    
    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      console.log(\`Searching for: "\${searchTerm}"\`);
      
      results = results.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const excerptMatch = article.excerpt.toLowerCase().includes(searchTerm);
        const problemsMatch = article.problemsSolved.some(problem => problem.toLowerCase().includes(searchTerm));
        const solutionsMatch = article.wayfairSolutions.some(solution => solution.toLowerCase().includes(searchTerm));
        const topicsMatch = article.topics.some(topic => this.searchIndex.topics[topic].toLowerCase().includes(searchTerm));
        
        return titleMatch || excerptMatch || problemsMatch || solutionsMatch || topicsMatch;
      });
      
      console.log(\`After text search: \${results.length} articles found\`);
    }
    
    return results;
  },

  getArticleById(id) {
    return this.getAllArticles().find(article => article.id === id);
  },

  getFeaturedArticles(limit = 5) {
    return this.tier1.slice(0, limit);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = articlesData;
}`;

    return content;
  }
  
  // Format article object for output
  formatArticleObject(article) {
    return `    {
      id: "${article.id}",
      title: "${article.title.replace(/"/g, '\\"')}",
      slug: "${article.slug}",
      category: "${article.category}",
      customerSegment: "${article.customerSegment}",
      painLevel: ${article.painLevel},
      topics: ${JSON.stringify(article.topics)},
      excerpt: "${article.excerpt.replace(/"/g, '\\"')}",
      readTime: ${article.readTime},
      publishDate: "${article.publishDate}",
      roi: "${article.roi.replace(/"/g, '\\"')}",
      problemsSolved: ${JSON.stringify(article.problemsSolved)},
      wayfairSolutions: ${JSON.stringify(article.wayfairSolutions)},
      metrics: {
        potentialSavings: "${article.metrics.potentialSavings.replace(/"/g, '\\"')}",
        implementationTime: "${article.metrics.implementationTime.replace(/"/g, '\\"')}",
        roiTimeframe: "${article.metrics.roiTimeframe.replace(/"/g, '\\"')}"
      }
    }`;
  }
}

// Run the generator if called directly
if (require.main === module) {
  const generator = new ArticlesDatabaseGenerator();
  generator.generateDatabase()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Database generation completed successfully!');
        process.exit(0);
      } else {
        console.error('\n❌ Database generation failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = ArticlesDatabaseGenerator; 