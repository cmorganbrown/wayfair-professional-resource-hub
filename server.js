const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database', 'articles.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
let db;
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
                return;
            }
            console.log('✅ Connected to SQLite database');
            resolve();
        });
    });
}

// API Routes

// Get all articles with filtering and search
app.get('/api/articles', async (req, res) => {
    try {
        const {
            search,
            segment,
            category,
            pain_level_min,
            pain_level_max,
            limit = 50,
            offset = 0,
            sort = 'publish_date',
            order = 'DESC'
        } = req.query;

        let query = `
            SELECT 
                id, slug, title, excerpt, customer_segment, pain_level,
                read_time, roi, topics, problems_solved, wayfair_solutions,
                publish_date, word_count
            FROM articles
        `;
        
        let conditions = [];
        let params = [];

        // Search functionality
        if (search) {
            // Use FTS if available, otherwise fall back to LIKE
            query = `
                SELECT 
                    a.id, a.slug, a.title, a.excerpt, a.customer_segment, 
                    a.pain_level, a.read_time, a.roi, a.topics, 
                    a.problems_solved, a.wayfair_solutions, a.publish_date, 
                    a.word_count,
                    fts.rank
                FROM articles a
                JOIN articles_fts fts ON a.id = fts.rowid
                WHERE articles_fts MATCH ?
            `;
            params.push(search);
        } else {
            // Filters
            if (segment) {
                conditions.push('customer_segment = ?');
                params.push(segment);
            }

            if (category) {
                conditions.push('category = ?');
                params.push(category);
            }

            if (pain_level_min) {
                conditions.push('pain_level >= ?');
                params.push(parseInt(pain_level_min));
            }

            if (pain_level_max) {
                conditions.push('pain_level <= ?');
                params.push(parseInt(pain_level_max));
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
        }

        // Sorting
        const allowedSorts = ['title', 'publish_date', 'pain_level', 'read_time', 'word_count'];
        const sortField = allowedSorts.includes(sort) ? sort : 'publish_date';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        if (!search) {
            query += ` ORDER BY ${sortField} ${sortOrder}`;
        } else {
            query += ` ORDER BY rank, publish_date DESC`;
        }

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const articles = await dbQuery(query, params);
        
        // Parse JSON fields
        const formattedArticles = articles.map(article => ({
            ...article,
            topics: JSON.parse(article.topics || '[]'),
            problems_solved: JSON.parse(article.problems_solved || '[]'),
            wayfair_solutions: JSON.parse(article.wayfair_solutions || '[]')
        }));

        res.json({
            articles: formattedArticles,
            total: formattedArticles.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get single article by slug
app.get('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const query = `
            SELECT * FROM articles 
            WHERE slug = ?
        `;
        
        const article = await dbGet(query, [slug]);
        
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Parse JSON fields
        const formattedArticle = {
            ...article,
            target_keywords: JSON.parse(article.target_keywords || '[]'),
            topics: JSON.parse(article.topics || '[]'),
            problems_solved: JSON.parse(article.problems_solved || '[]'),
            wayfair_solutions: JSON.parse(article.wayfair_solutions || '[]'),
            metrics: JSON.parse(article.metrics || '{}')
        };

        // Track view
        await trackArticleView(article.id);

        res.json(formattedArticle);

    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Get articles by customer segment
app.get('/api/segments/:segment/articles', async (req, res) => {
    try {
        const { segment } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const query = `
            SELECT 
                id, slug, title, excerpt, pain_level, read_time, roi,
                topics, problems_solved, publish_date
            FROM articles 
            WHERE customer_segment = ?
            ORDER BY pain_level DESC, publish_date DESC
            LIMIT ? OFFSET ?
        `;

        const articles = await dbQuery(query, [segment, parseInt(limit), parseInt(offset)]);
        
        const formattedArticles = articles.map(article => ({
            ...article,
            topics: JSON.parse(article.topics || '[]'),
            problems_solved: JSON.parse(article.problems_solved || '[]')
        }));

        res.json({
            segment,
            articles: formattedArticles,
            total: formattedArticles.length
        });

    } catch (error) {
        console.error('Error fetching segment articles:', error);
        res.status(500).json({ error: 'Failed to fetch segment articles' });
    }
});

// Get article suggestions/related articles
app.get('/api/articles/:slug/related', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // First get the current article to find related ones
        const currentArticle = await dbGet('SELECT * FROM articles WHERE slug = ?', [slug]);
        
        if (!currentArticle) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Find related articles based on customer segment and topics
        const query = `
            SELECT 
                id, slug, title, excerpt, pain_level, read_time, roi,
                customer_segment, topics
            FROM articles 
            WHERE customer_segment = ? AND slug != ?
            ORDER BY pain_level DESC, publish_date DESC
            LIMIT 5
        `;

        const relatedArticles = await dbQuery(query, [currentArticle.customer_segment, slug]);
        
        const formattedArticles = relatedArticles.map(article => ({
            ...article,
            topics: JSON.parse(article.topics || '[]')
        }));

        res.json({
            related_articles: formattedArticles
        });

    } catch (error) {
        console.error('Error fetching related articles:', error);
        res.status(500).json({ error: 'Failed to fetch related articles' });
    }
});

// Search articles with full-text search
app.get('/api/search', async (req, res) => {
    try {
        const { q, segment, limit = 20, offset = 0 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        let query = `
            SELECT 
                a.id, a.slug, a.title, a.excerpt, a.customer_segment,
                a.pain_level, a.read_time, a.roi, a.topics,
                fts.rank
            FROM articles a
            JOIN articles_fts fts ON a.id = fts.rowid
            WHERE articles_fts MATCH ?
        `;
        
        let params = [q];

        if (segment) {
            query += ' AND a.customer_segment = ?';
            params.push(segment);
        }

        query += ' ORDER BY rank LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const results = await dbQuery(query, params);
        
        const formattedResults = results.map(article => ({
            ...article,
            topics: JSON.parse(article.topics || '[]')
        }));

        res.json({
            query: q,
            results: formattedResults,
            total: formattedResults.length
        });

    } catch (error) {
        console.error('Error searching articles:', error);
        // Fallback to LIKE search if FTS fails
        try {
            const fallbackQuery = `
                SELECT 
                    id, slug, title, excerpt, customer_segment,
                    pain_level, read_time, roi, topics
                FROM articles 
                WHERE title LIKE ? OR excerpt LIKE ?
                ${req.query.segment ? 'AND customer_segment = ?' : ''}
                ORDER BY pain_level DESC
                LIMIT ? OFFSET ?
            `;
            
            let fallbackParams = [`%${req.query.q}%`, `%${req.query.q}%`];
            if (req.query.segment) fallbackParams.push(req.query.segment);
            fallbackParams.push(parseInt(req.query.limit || 20), parseInt(req.query.offset || 0));

            const results = await dbQuery(fallbackQuery, fallbackParams);
            const formattedResults = results.map(article => ({
                ...article,
                topics: JSON.parse(article.topics || '[]')
            }));

            res.json({
                query: req.query.q,
                results: formattedResults,
                total: formattedResults.length,
                fallback: true
            });
        } catch (fallbackError) {
            res.status(500).json({ error: 'Search failed' });
        }
    }
});

// Get customer segments with article counts
app.get('/api/segments', async (req, res) => {
    try {
        const query = `
            SELECT 
                cs.slug,
                cs.name,
                cs.description,
                COUNT(a.id) as article_count
            FROM customer_segments cs
            LEFT JOIN articles a ON cs.slug = a.customer_segment
            GROUP BY cs.slug, cs.name, cs.description
            ORDER BY cs.priority, cs.name
        `;

        const segments = await dbQuery(query);
        res.json({ segments });

    } catch (error) {
        console.error('Error fetching segments:', error);
        res.status(500).json({ error: 'Failed to fetch segments' });
    }
});

// Track consultation request
app.post('/api/track/consultation', async (req, res) => {
    try {
        const { article_id, article_slug } = req.body;
        
        let articleId = article_id;
        if (!articleId && article_slug) {
            const article = await dbGet('SELECT id FROM articles WHERE slug = ?', [article_slug]);
            articleId = article?.id;
        }

        if (articleId) {
            await trackConsultationRequest(articleId);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking consultation:', error);
        res.status(500).json({ error: 'Failed to track consultation' });
    }
});

// Article page route - serves individual articles
app.get('/article/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const article = await dbGet('SELECT * FROM articles WHERE slug = ?', [slug]);
        
        if (!article) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Article Not Found</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <h1>Article Not Found</h1>
                    <p>The article you're looking for doesn't exist.</p>
                    <a href="/">← Back to Home</a>
                </body>
                </html>
            `);
        }

        // Track view
        await trackArticleView(article.id);

        // Parse JSON fields
        const formattedArticle = {
            ...article,
            target_keywords: JSON.parse(article.target_keywords || '[]'),
            topics: JSON.parse(article.topics || '[]'),
            problems_solved: JSON.parse(article.problems_solved || '[]'),
            wayfair_solutions: JSON.parse(article.wayfair_solutions || '[]')
        };

        // Generate article page HTML
        const articleHtml = generateArticleHTML(formattedArticle);
        res.send(articleHtml);

    } catch (error) {
        console.error('Error serving article page:', error);
        res.status(500).send('Internal server error');
    }
});

// Database helper functions
function dbQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this);
        });
    });
}

// Analytics tracking
async function trackArticleView(articleId) {
    try {
        await dbRun(`
            INSERT OR REPLACE INTO article_analytics 
            (article_id, views, last_viewed) 
            VALUES (
                ?, 
                COALESCE((SELECT views FROM article_analytics WHERE article_id = ?), 0) + 1,
                CURRENT_TIMESTAMP
            )
        `, [articleId, articleId]);
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

async function trackConsultationRequest(articleId) {
    try {
        await dbRun(`
            INSERT OR REPLACE INTO article_analytics 
            (article_id, consultations_requested) 
            VALUES (
                ?, 
                COALESCE((SELECT consultations_requested FROM article_analytics WHERE article_id = ?), 0) + 1
            )
        `, [articleId, articleId]);
    } catch (error) {
        console.error('Error tracking consultation:', error);
    }
}

// Generate HTML for individual article pages
function generateArticleHTML(article) {
    const keywords = Array.isArray(article.target_keywords) ? article.target_keywords.join(', ') : '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | Wayfair Professional</title>
    <meta name="description" content="${article.meta_description || article.excerpt}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://wayfair-professional-resource-hub-production.up.railway.app/article/${article.slug}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://wayfair-professional-resource-hub-production.up.railway.app/article/${article.slug}">
    <meta property="twitter:title" content="${article.title}">
    <meta property="twitter:description" content="${article.excerpt}">
    
    <link rel="stylesheet" href="/styles/main.css">
    <style>
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        .article-meta {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        .article-content {
            font-size: 1.1rem;
        }
        .article-content h1, .article-content h2, .article-content h3 {
            color: #2c3e50;
            margin-top: 2rem;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            color: #7b2cbf;
            text-decoration: none;
        }
        .consultation-cta {
            background: linear-gradient(135deg, #7b2cbf, #9d4edd);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin: 3rem 0;
            text-align: center;
        }
        .btn-consultation {
            background: white;
            color: #7b2cbf;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="article-container">
        <a href="/" class="back-link">← Back to Home</a>
        
        <article>
            <div class="article-meta">
                <h1>${article.title}</h1>
                ${article.subtitle ? `<p class="subtitle">${article.subtitle}</p>` : ''}
                <div class="meta-info">
                    <span>📖 ${article.read_time} min read</span>
                    <span>💼 ${article.customer_segment.replace('-', ' ')}</span>
                    ${article.roi ? `<span>📈 ${article.roi}</span>` : ''}
                </div>
            </div>
            
            <div class="article-content">
                ${article.content}
            </div>
            
            <div class="consultation-cta">
                <h3>Ready to Transform Your Space?</h3>
                <p>Get expert consultation and custom solutions for your commercial furniture needs.</p>
                <button class="btn-consultation" onclick="requestConsultation('${article.slug}')">
                    Get Free Consultation
                </button>
            </div>
        </article>
    </div>
    
    <script>
        function requestConsultation(slug) {
            fetch('/api/track/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_slug: slug })
            });
            
            alert('Thank you for your interest! Our team will contact you within 24 hours to discuss your project needs.');
        }
    </script>
</body>
</html>
    `;
}

// Start server
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📖 Database: ${DB_PATH}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 