// Articles Database - Wayfair Professional Resource Hub
// Contains all articles with metadata for search and categorization

const articlesData = {
  // Tier 1 High-Impact Articles (Pain Level 8-9)
  tier1: [
    {
      id: "tier1_001",
      title: "Hybrid Work Furniture Solutions: Optimizing Employee Wellness and Productivity",
      slug: "hybrid-work-furniture-solutions-employee-wellness-productivity",
      category: "Office Procurement",
      customerSegment: "office-procurement",
      painLevel: 8,
      topics: ["workflow-efficiency", "cost-optimization", "technology"],
      excerpt: "Transform your hybrid workspace with ergonomic solutions that boost productivity by 30% while reducing real estate costs. Comprehensive guide to modern office furniture strategies.",
      readTime: 8,
      publishDate: "2024-01-15",
      roi: "30% productivity increase, $2.3B market opportunity",
      problemsSolved: ["Employee wellness concerns", "Productivity optimization", "Real estate cost reduction", "Hybrid work adaptation"],
      wayfairSolutions: ["Ergonomic office chairs", "Adjustable desks", "Collaborative furniture", "Space-saving solutions"],
      metrics: {
        potentialSavings: "$15,000-50,000 annually per 50 employees",
        implementationTime: "2-4 weeks",
        roiTimeframe: "6-12 months"
      },
      content: `
        <h2>The $2.3 Billion Hybrid Work Challenge</h2>
        <p>The shift to hybrid work has created a $2.3 billion furniture market opportunity, but most organizations are struggling with outdated office setups that reduce productivity by up to 40%. Modern hybrid workspaces require strategic furniture solutions that address both in-office and remote work needs.</p>
        
        <h3>Critical Success Factors for Hybrid Furniture Strategy</h3>
        <p><strong>1. Flexibility-First Design</strong><br>
        Choose modular furniture systems that adapt to changing team sizes and work styles. Wayfair Professional's modular desk systems allow quick reconfiguration as teams shift between remote and in-office work.</p>
        
        <p><strong>2. Employee Wellness Integration</strong><br>
        Ergonomic furniture isn't optional—it's essential. Poor workplace ergonomics cost companies $3,000-5,000 annually per employee in healthcare and lost productivity.</p>
        
        <p><strong>3. Technology-Enabled Collaboration</strong><br>
        Integrate furniture with technology infrastructure. Modern conference tables with built-in power and connectivity support seamless hybrid meetings.</p>
        
        <h3>Implementation Strategy</h3>
        <p>Start with high-impact areas: conference rooms and collaboration spaces. These changes deliver immediate ROI through improved meeting efficiency and employee satisfaction.</p>
        
        <div class="cta-box">
          <h4>Ready to Optimize Your Hybrid Workspace?</h4>
          <p>Get a FREE workspace analysis and custom furniture recommendations from Wayfair Professional.</p>
          <a href="#consultation" class="btn btn-primary">Schedule Free Consultation</a>
        </div>
      `
    },
    {
      id: "tier1_002",
      title: "Construction Project Timeline Management: Preventing $25K-100K Delivery Disasters",
      slug: "construction-project-timeline-management-delivery-disasters",
      category: "Contractors",
      customerSegment: "contractors",
      painLevel: 9,
      topics: ["workflow-efficiency", "cost-optimization"],
      excerpt: "Stop construction delays! Master furniture delivery coordination that saves $25,000-100,000 per project. Proven strategies from 500+ successful commercial builds.",
      readTime: 7,
      publishDate: "2024-01-10",
      roi: "Prevents $25K-100K delays per project",
      problemsSolved: ["Construction delays", "Budget overruns", "Client dissatisfaction", "Project coordination chaos"],
      wayfairSolutions: ["Project management tools", "Scheduled delivery", "White-glove installation", "Dedicated account management"],
      metrics: {
        potentialSavings: "$25,000-100,000 per project",
        implementationTime: "Immediate",
        roiTimeframe: "Per project basis"
      },
      content: `
        <h2>The Cost of the Next Delivery Disaster: $25,000-100,000. The Cost of Prevention: $0.</h2>
        <p>Construction delays from furniture delivery failures cost projects $25,000-100,000 in extended labor, penalties, and client relations damage. Yet 73% of contractors still manage furniture delivery through informal coordination.</p>
        
        <h3>The 4-Phase Delivery Coordination System</h3>
        <p><strong>Phase 1: Pre-Construction Planning (8-12 weeks out)</strong><br>
        Lock in delivery schedules with suppliers offering project management services. Wayfair Professional's dedicated project managers coordinate with your construction timeline.</p>
        
        <p><strong>Phase 2: Critical Path Integration (4-6 weeks out)</strong><br>
        Align furniture delivery with electrical, flooring, and final inspection milestones. Build in 5-day buffer zones for unexpected delays.</p>
        
        <p><strong>Phase 3: Delivery Coordination (Week of installation)</strong><br>
        Confirm site readiness 48 hours before delivery. Ensure loading dock access, elevator availability, and temporary storage space.</p>
        
        <p><strong>Phase 4: Installation Management</strong><br>
        Use white-glove installation services to prevent damage and ensure proper setup. Professional installation reduces post-delivery issues by 89%.</p>
        
        <div class="cta-box">
          <h4>Stop Your Next Delivery Disaster</h4>
          <p>Get FREE project analysis and coordination support from Wayfair Professional's construction specialists.</p>
          <a href="#consultation" class="btn btn-primary">Get Free Project Analysis</a>
        </div>
      `
    },
    {
      id: "tier1_003",
      title: "Interior Design Delivery Reliability: Eliminating Client Project Delays",
      slug: "interior-design-delivery-reliability-client-project-delays",
      category: "Interior Designers",
      customerSegment: "interior-designers",
      painLevel: 9,
      topics: ["workflow-efficiency", "cost-optimization"],
      excerpt: "End client disappointment from furniture delays. Proven delivery strategies that reduce project delays by 60% and increase client satisfaction to 95%+. Essential for design professionals.",
      readTime: 9,
      publishDate: "2024-01-12",
      roi: "60% reduction in project delays",
      problemsSolved: ["Client project delays", "Reputation damage", "Budget overruns", "Delivery coordination chaos"],
      wayfairSolutions: ["Trade program pricing", "Dedicated account manager", "Project tracking tools", "White-glove delivery"],
      metrics: {
        potentialSavings: "60% fewer delays, 95% client satisfaction",
        implementationTime: "Immediate enrollment",
        roiTimeframe: "First project"
      },
      content: `
        <h2>Client Projects Failing Due to Furniture Delays? Here's Your Solution.</h2>
        <p>Interior designers lose an average of $12,000 per delayed project in extended overhead, client relations damage, and lost referrals. The solution isn't better furniture—it's better delivery strategy.</p>
        
        <h3>The Professional Designer's Delivery Protocol</h3>
        <p><strong>1. Vendor Qualification System</strong><br>
        Work exclusively with suppliers offering dedicated trade support. Wayfair Professional's trade program provides account managers, tracking tools, and priority delivery scheduling.</p>
        
        <p><strong>2. Client Expectation Management</strong><br>
        Set delivery expectations 20% longer than supplier estimates. Under-promise and over-deliver to exceed client expectations consistently.</p>
        
        <p><strong>3. Multi-Phase Delivery Strategy</strong><br>
        Schedule deliveries in phases: base furniture first, accent pieces second, artwork and accessories final. This prevents single-point-of-failure delays.</p>
        
        <p><strong>4. Contingency Planning</strong><br>
        Maintain relationships with 3+ suppliers for critical categories. When delays occur, pivot quickly with pre-approved alternatives.</p>
        
        <h3>The 95% Client Satisfaction Formula</h3>
        <p>Top designers achieve 95%+ client satisfaction by combining proactive communication, realistic timelines, and reliable supplier partnerships.</p>
        
        <div class="cta-box">
          <h4>Join Wayfair Professional's Trade Program</h4>
          <p>Get trade pricing, dedicated support, and delivery reliability that protects your reputation.</p>
          <a href="#consultation" class="btn btn-primary">Apply for Trade Program</a>
        </div>
      `
    },
    {
      id: "tier1_004",
      title: "Educational Furniture Funding: Unlocking 20-30% Budget Savings",
      slug: "educational-furniture-funding-budget-savings-strategies",
      category: "Education",
      customerSegment: "education",
      painLevel: 9,
      topics: ["cost-optimization", "compliance"],
      excerpt: "Maximize educational furniture budgets with proven funding strategies. Access grant programs, volume pricing, and lease options that stretch budgets 20-30% further.",
      readTime: 8,
      publishDate: "2024-01-08",
      roi: "20-30% budget extension through strategic procurement",
      problemsSolved: ["Limited budgets", "Grant application complexity", "Procurement inefficiency", "Long-term planning challenges"],
      wayfairSolutions: ["Educational pricing programs", "Bulk order discounts", "Flexible payment terms", "Grant application support"],
      metrics: {
        potentialSavings: "20-30% budget extension",
        implementationTime: "Grant cycle dependent",
        roiTimeframe: "Per academic year"
      },
      content: `
        <h2>Turn $100,000 Furniture Budgets Into $130,000 of Value</h2>
        <p>Educational institutions leave millions in funding on the table annually. Strategic procurement and funding optimization can extend furniture budgets by 20-30% without compromising quality.</p>
        
        <h3>The 5-Source Funding Strategy</h3>
        <p><strong>1. Federal Grant Programs</strong><br>
        Title I, IDEA, and 21st Century Community Learning Centers provide furniture funding. Most schools miss these opportunities due to application complexity.</p>
        
        <p><strong>2. State Education Technology Grants</strong><br>
        Many states offer grants specifically for classroom modernization, including flexible learning furniture.</p>
        
        <p><strong>3. Corporate Partnership Programs</strong><br>
        Partner with local businesses for furniture sponsorship in exchange for naming rights or student internship programs.</p>
        
        <p><strong>4. Volume Purchasing Cooperatives</strong><br>
        Join educational purchasing consortiums for bulk pricing. Wayfair Professional's education pricing can reduce costs 15-25% below retail.</p>
        
        <p><strong>5. Lease-to-Own Programs</strong><br>
        Spread costs across multiple budget years while accessing furniture immediately. Especially effective for technology-integrated furniture.</p>
        
        <h3>Grant Application Success Formula</h3>
        <p>Successful grant applications focus on student outcomes, not furniture features. Demonstrate how modern learning environments improve test scores and engagement.</p>
        
        <div class="cta-box">
          <h4>Maximize Your Education Budget</h4>
          <p>Get FREE funding consultation and educational pricing from Wayfair Professional's education specialists.</p>
          <a href="#consultation" class="btn btn-primary">Get Funding Consultation</a>
        </div>
      `
    },
    {
      id: "tier1_005",
      title: "Employee Wellness Through Ergonomics: $3K-5K Annual Savings Per Employee",
      slug: "employee-wellness-ergonomics-annual-savings",
      category: "Office Procurement",
      customerSegment: "office-procurement",
      painLevel: 8,
      topics: ["cost-optimization", "compliance", "workflow-efficiency"],
      excerpt: "Reduce healthcare costs by $3,000-5,000 per employee annually through strategic ergonomic furniture investments. Complete ROI analysis and implementation guide.",
      readTime: 7,
      publishDate: "2024-01-05",
      roi: "$3,000-5,000 annual savings per employee",
      problemsSolved: ["High healthcare costs", "Employee discomfort", "Productivity loss", "Workers compensation claims"],
      wayfairSolutions: ["Ergonomic office chairs", "Adjustable desks", "Monitor arms", "Footrests and accessories"],
      metrics: {
        potentialSavings: "$3,000-5,000 per employee annually",
        implementationTime: "2-4 weeks",
        roiTimeframe: "12-18 months"
      },
      content: `
        <h2>The Hidden $150,000 Annual Cost in Your 50-Person Office</h2>
        <p>Poor workplace ergonomics costs the average company $3,000-5,000 per employee annually in healthcare expenses, lost productivity, and workers compensation claims. For a 50-person office, that's $150,000-250,000 in preventable costs.</p>
        
        <h3>The Ergonomic ROI Formula</h3>
        <p><strong>Investment: $800-1,500 per workstation</strong><br>
        Quality ergonomic chair ($400-800) + adjustable desk ($400-700)<br>
        Total 50-workstation investment: $40,000-75,000</p>
        
        <p><strong>Annual Savings: $150,000-250,000</strong><br>
        Reduced healthcare claims + decreased absenteeism + increased productivity<br>
        ROI: 200-600% in year one</p>
        
        <h3>Implementation Priorities</h3>
        <p><strong>Phase 1: High-Risk Positions (Immediate)</strong><br>
        Target employees with existing discomfort or previous claims. Focus on administrative staff spending 6+ hours daily at desks.</p>
        
        <p><strong>Phase 2: Company-Wide Rollout (Months 2-6)</strong><br>
        Implement ergonomic assessments for all workstations. Provide adjustable desks and quality seating across the organization.</p>
        
        <p><strong>Phase 3: Maintenance and Optimization (Ongoing)</strong><br>
        Regular ergonomic training and workstation adjustments ensure long-term effectiveness.</p>
        
        <div class="cta-box">
          <h4>Calculate Your Ergonomic ROI</h4>
          <p>Get FREE ergonomic assessment and ROI calculation from Wayfair Professional's wellness specialists.</p>
          <a href="#consultation" class="btn btn-primary">Get Free Assessment</a>
        </div>
      `
    }
  ],

  // Article metadata for search and filtering
  searchIndex: {
    customerSegments: {
      "interior-designers": "Interior Designers",
      "contractors": "Contractors", 
      "office-procurement": "Office Procurement",
      "accommodations": "Accommodations",
      "education": "Education",
      "foodservice": "Foodservice",
      "property-management": "Property Management"
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

  // Tier 2 and Tier 3 articles would be added here as they're completed
  tier2: [],
  tier3: [],

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
    console.log(`Starting search with query: "${query}", filters:`, filters);
    console.log(`Total articles available: ${results.length}`);
    
    // Filter by customer segment
    if (filters.customerSegment) {
      results = results.filter(article => article.customerSegment === filters.customerSegment);
      console.log(`After customer segment filter (${filters.customerSegment}): ${results.length} articles`);
    }
    
    // Filter by pain level
    if (filters.painLevel) {
      const range = this.searchIndex.painLevels[filters.painLevel];
      if (range) {
        results = results.filter(article => 
          article.painLevel >= range.min && article.painLevel <= range.max
        );
        console.log(`After pain level filter (${filters.painLevel}): ${results.length} articles`);
      }
    }
    
    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      console.log(`Searching for: "${searchTerm}"`);
      
      // Log what we're searching against for debugging
      results.forEach((article, index) => {
        console.log(`Article ${index + 1}: "${article.title}"`);
      });
      
      results = results.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const excerptMatch = article.excerpt.toLowerCase().includes(searchTerm);
        const problemsMatch = article.problemsSolved.some(problem => problem.toLowerCase().includes(searchTerm));
        const solutionsMatch = article.wayfairSolutions.some(solution => solution.toLowerCase().includes(searchTerm));
        const topicsMatch = article.topics.some(topic => this.searchIndex.topics[topic].toLowerCase().includes(searchTerm));
        
        const match = titleMatch || excerptMatch || problemsMatch || solutionsMatch || topicsMatch;
        
        if (match) {
          console.log(`Match found in article: "${article.title}"`);
          if (titleMatch) console.log(`  - Title match`);
          if (excerptMatch) console.log(`  - Excerpt match`);
          if (problemsMatch) console.log(`  - Problems match`);
          if (solutionsMatch) console.log(`  - Solutions match`);
          if (topicsMatch) console.log(`  - Topics match`);
        }
        
        return match;
      });
      
      console.log(`After text search: ${results.length} articles found`);
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
} 