-- Articles Database Schema for Wayfair Professional Resource Hub
-- SQLite database schema for storing article content and metadata

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    meta_description TEXT,
    target_keywords TEXT, -- JSON array of keywords
    category TEXT NOT NULL,
    customer_segment TEXT NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 9),
    topics TEXT NOT NULL, -- JSON array of topic tags
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Full HTML content
    read_time INTEGER NOT NULL,
    publish_date DATE,
    roi TEXT,
    problems_solved TEXT, -- JSON array
    wayfair_solutions TEXT, -- JSON array
    metrics TEXT, -- JSON object with potential savings, implementation time, etc.
    potential_savings TEXT,
    implementation_time TEXT,
    roi_timeframe TEXT,
    file_source TEXT, -- Original filename for tracking
    word_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_customer_segment ON articles(customer_segment);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_pain_level ON articles(pain_level);
CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date);

-- Create full-text search index for content search
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    title, 
    excerpt, 
    content, 
    problems_solved, 
    wayfair_solutions,
    content='articles',
    content_rowid='id'
);

-- Trigger to maintain FTS index
CREATE TRIGGER IF NOT EXISTS articles_fts_insert AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, title, excerpt, content, problems_solved, wayfair_solutions) 
    VALUES (new.id, new.title, new.excerpt, new.content, new.problems_solved, new.wayfair_solutions);
END;

CREATE TRIGGER IF NOT EXISTS articles_fts_delete AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content, problems_solved, wayfair_solutions) 
    VALUES ('delete', old.id, old.title, old.excerpt, old.content, old.problems_solved, old.wayfair_solutions);
END;

CREATE TRIGGER IF NOT EXISTS articles_fts_update AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content, problems_solved, wayfair_solutions) 
    VALUES ('delete', old.id, old.title, old.excerpt, old.content, old.problems_solved, old.wayfair_solutions);
    INSERT INTO articles_fts(rowid, title, excerpt, content, problems_solved, wayfair_solutions) 
    VALUES (new.id, new.title, new.excerpt, new.content, new.problems_solved, new.wayfair_solutions);
END;

-- Create table for tracking article topics (normalized)
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default topics
INSERT OR IGNORE INTO topics (slug, name, description) VALUES
('cost-optimization', 'Cost Optimization', 'Strategies to reduce procurement costs and maximize budget efficiency'),
('space-planning', 'Space Planning', 'Layout optimization and space utilization best practices'),
('workflow-efficiency', 'Workflow Efficiency', 'Process improvement and operational optimization solutions'),
('compliance', 'Compliance & Safety', 'Regulatory requirements and safety standards guidance'),
('technology', 'Technology Integration', 'Smart furniture and tech-enabled workspace solutions'),
('durability', 'Durability & Maintenance', 'Long-term value and maintenance strategies');

-- Create table for customer segments (normalized)
CREATE TABLE IF NOT EXISTS customer_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    article_count_target INTEGER,
    priority INTEGER DEFAULT 0, -- 0=primary, 1=secondary, 2=tertiary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert customer segments
INSERT OR IGNORE INTO customer_segments (slug, name, description, article_count_target, priority) VALUES
('interior-designers', 'Interior Designers', 'Professional interior designers working on residential and commercial projects', 100, 0),
('contractors', 'Contractors', 'General contractors and specialized contractors working on construction and renovation projects', 25, 1),
('office-procurement', 'Office Procurement', 'Corporate procurement teams responsible for office furniture and workspace design', 25, 1),
('accommodations', 'Accommodations', 'Hotel managers, hospitality designers, and accommodation facility managers', 25, 1),
('education', 'Education', 'Educational institutions, administrators, and facility managers', 20, 2),
('foodservice', 'Foodservice', 'Restaurant operators, commercial kitchen managers, and foodservice facility planners', 20, 2),
('property-management', 'Property Management', 'Property managers, real estate developers, and facility management companies', 20, 2);

-- Create junction table for many-to-many article-topic relationships
CREATE TABLE IF NOT EXISTS article_topics (
    article_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    PRIMARY KEY (article_id, topic_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Create table for article metrics and analytics
CREATE TABLE IF NOT EXISTS article_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    searches INTEGER DEFAULT 0,
    consultations_requested INTEGER DEFAULT 0,
    last_viewed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_article_id ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views ON article_analytics(views);

-- Create view for article summary with segment info
CREATE VIEW IF NOT EXISTS article_summary AS
SELECT 
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.customer_segment,
    cs.name as segment_name,
    a.pain_level,
    a.read_time,
    a.roi,
    a.publish_date,
    a.word_count,
    COALESCE(aa.views, 0) as view_count,
    COALESCE(aa.consultations_requested, 0) as consultation_count
FROM articles a
LEFT JOIN customer_segments cs ON a.customer_segment = cs.slug
LEFT JOIN article_analytics aa ON a.id = aa.article_id;

-- Create view for search results with relevance scoring
CREATE VIEW IF NOT EXISTS search_results AS
SELECT 
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.customer_segment,
    cs.name as segment_name,
    a.pain_level,
    a.read_time,
    a.roi,
    a.problems_solved,
    a.wayfair_solutions,
    a.topics,
    COALESCE(aa.views, 0) as popularity_score
FROM articles a
LEFT JOIN customer_segments cs ON a.customer_segment = cs.slug
LEFT JOIN article_analytics aa ON a.id = aa.article_id; 