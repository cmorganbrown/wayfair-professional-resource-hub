#!/usr/bin/env node

/**
 * Article Migration Script
 * Converts markdown files to database records for the Wayfair Professional Resource Hub
 * 
 * This script:
 * 1. Parses all markdown files in the articles directory
 * 2. Extracts frontmatter and content
 * 3. Converts markdown to HTML
 * 4. Generates SEO-friendly slugs
 * 5. Populates the SQLite database
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const matter = require('gray-matter');
const { marked } = require('marked');

// Configuration
const ARTICLES_DIR = path.join(__dirname, '../articles');
const DB_PATH = path.join(__dirname, '../database/articles.db');
const SCHEMA_PATH = path.join(__dirname, '../database/schema.sql');

// Customer segment mapping for inference
const SEGMENT_PATTERNS = {
    'interior': 'interior-designers',
    'contractors': 'contractors',
    'office': 'office-procurement',
    'accommodation': 'accommodations',
    'hotel': 'accommodations',
    'education': 'education',
    'foodservice': 'foodservice',
    'property': 'property-management'
};

// Topic mapping
const TOPIC_PATTERNS = {
    'cost': 'cost-optimization',
    'budget': 'cost-optimization',
    'pricing': 'cost-optimization',
    'space': 'space-planning',
    'planning': 'space-planning',
    'design': 'space-planning',
    'workflow': 'workflow-efficiency',
    'efficiency': 'workflow-efficiency',
    'productivity': 'workflow-efficiency',
    'compliance': 'compliance',
    'safety': 'compliance',
    'technology': 'technology',
    'smart': 'technology',
    'digital': 'technology',
    'durability': 'durability',
    'maintenance': 'durability',
    'quality': 'durability'
};

class ArticleMigrator {
    constructor() {
        this.db = null;
        this.stats = {
            processed: 0,
            successful: 0,
            errors: 0,
            skipped: 0
        };
    }

    async initialize() {
        console.log('🚀 Starting article migration to database...\n');
        
        // Initialize database
        await this.initializeDatabase();
        
        // Get all markdown files
        const files = this.getMarkdownFiles();
        console.log(`Found ${files.length} markdown files to process\n`);
        
        return files;
    }

    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            // Create database directory if it doesn't exist
            const dbDir = path.dirname(DB_PATH);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('✅ Database connection established');
                
                // Execute schema
                const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
                this.db.exec(schema, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log('✅ Database schema created');
                    resolve();
                });
            });
        });
    }

    getMarkdownFiles() {
        const files = fs.readdirSync(ARTICLES_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(ARTICLES_DIR, file));
        
        return files;
    }

    generateSlug(title, filename) {
        // Try to generate from title first, fallback to filename
        const source = title || path.basename(filename, '.md');
        return source
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Remove multiple consecutive hyphens
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            .substring(0, 100); // Limit length
    }

    inferCustomerSegment(filename, content) {
        const text = (filename + ' ' + content).toLowerCase();
        
        for (const [pattern, segment] of Object.entries(SEGMENT_PATTERNS)) {
            if (text.includes(pattern)) {
                return segment;
            }
        }
        
        // Default based on filename patterns
        if (filename.includes('tier1')) return 'office-procurement';
        if (filename.includes('article_6')) return 'office-procurement';
        
        return 'interior-designers'; // Default to primary segment
    }

    inferTopics(filename, content) {
        const text = (filename + ' ' + content).toLowerCase();
        const topics = new Set();
        
        for (const [pattern, topic] of Object.entries(TOPIC_PATTERNS)) {
            if (text.includes(pattern)) {
                topics.add(topic);
            }
        }
        
        // Ensure at least one topic
        if (topics.size === 0) {
            topics.add('workflow-efficiency');
        }
        
        return Array.from(topics);
    }

    inferPainLevel(filename, content) {
        const text = (filename + ' ' + content).toLowerCase();
        
        // High priority indicators
        if (text.includes('tier1') || 
            text.includes('critical') || 
            text.includes('urgent') ||
            text.includes('crisis') ||
            filename.includes('tier1')) {
            return Math.floor(Math.random() * 2) + 8; // 8-9
        }
        
        // Medium priority indicators
        if (text.includes('important') || 
            text.includes('strategic') ||
            text.includes('optimization')) {
            return Math.floor(Math.random() * 2) + 6; // 6-7
        }
        
        // Standard priority
        return Math.floor(Math.random() * 2) + 4; // 4-5
    }

    extractROI(content) {
        // Look for ROI patterns in content
        const roiPatterns = [
            /(\d+%\s+(?:increase|improvement|reduction|savings?))/gi,
            /(\$[\d,]+(?:\.\d+)?(?:M|K|B)?\s+(?:savings?|cost reduction|improvement))/gi,
            /(\d+%\s+(?:faster|quicker|more efficient))/gi
        ];
        
        const matches = [];
        roiPatterns.forEach(pattern => {
            const found = content.match(pattern);
            if (found) matches.push(...found);
        });
        
        if (matches.length > 0) {
            return matches.slice(0, 2).join(', ');
        }
        
        // Default ROI based on customer segment
        const defaultROIs = [
            "15-25% cost savings",
            "30% productivity increase", 
            "20% space optimization",
            "40% efficiency improvement",
            "25% time savings"
        ];
        
        return defaultROIs[Math.floor(Math.random() * defaultROIs.length)];
    }

    extractProblems(content) {
        // Look for problems in content
        const problemPatterns = [
            /(?:challenges?|problems?|issues?|concerns?|difficulties)[:\s]+([^.!?]+[.!?])/gi,
            /(?:solves?|addresses?|fixes?)[:\s]+([^.!?]+[.!?])/gi
        ];
        
        const problems = [];
        problemPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = match.replace(/^[^:]+:\s*/, '').trim();
                    if (cleaned.length > 10 && cleaned.length < 100) {
                        problems.push(cleaned);
                    }
                });
            }
        });
        
        if (problems.length === 0) {
            // Default problems based on common themes
            const defaults = [
                "Cost management challenges",
                "Space optimization issues", 
                "Workflow inefficiencies",
                "Quality and durability concerns",
                "Compliance requirements"
            ];
            return defaults.slice(0, 3);
        }
        
        return problems.slice(0, 5);
    }

    extractWayfairSolutions(content) {
        // Look for solution mentions
        const solutionPatterns = [
            /wayfair professional[^.!?]*[.!?]/gi,
            /(?:solutions?|services?|products?)[:\s]+([^.!?]+[.!?])/gi
        ];
        
        const solutions = [];
        solutionPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = match.replace(/^[^:]+:\s*/, '').trim();
                    if (cleaned.length > 10 && cleaned.length < 100) {
                        solutions.push(cleaned);
                    }
                });
            }
        });
        
        if (solutions.length === 0) {
            // Default Wayfair solutions
            const defaults = [
                "Professional trade pricing",
                "Expert design consultation",
                "Project management services",
                "Custom furniture solutions",
                "Bulk ordering and delivery"
            ];
            return defaults.slice(0, 3);
        }
        
        return solutions.slice(0, 5);
    }

    calculateReadTime(content) {
        // Average reading speed: 200-250 words per minute
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 225));
    }

    async processFile(filePath) {
        try {
            this.stats.processed++;
            
            const filename = path.basename(filePath);
            console.log(`📄 Processing: ${filename}`);
            
            // Read and parse file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const parsed = matter(fileContent);
            
            // Extract or infer metadata
            const title = parsed.data.title || 
                         this.extractTitleFromContent(parsed.content) || 
                         filename.replace(/\.md$/, '').replace(/[_-]/g, ' ');
            
            const slug = this.generateSlug(title, filename);
            const customerSegment = parsed.data.customerSegment || 
                                  this.inferCustomerSegment(filename, parsed.content);
            const topics = parsed.data.topics || 
                          this.inferTopics(filename, parsed.content);
            const painLevel = parsed.data.painLevel || 
                            this.inferPainLevel(filename, parsed.content);
            
            // Convert markdown to HTML
            const htmlContent = marked(parsed.content);
            
            // Extract additional metadata
            const wordCount = parsed.content.split(/\s+/).length;
            const readTime = this.calculateReadTime(parsed.content);
            const excerpt = this.generateExcerpt(parsed.content);
            const roi = this.extractROI(parsed.content);
            const problems = this.extractProblems(parsed.content);
            const solutions = this.extractWayfairSolutions(parsed.content);
            
            // Prepare article data
            const articleData = {
                slug,
                title,
                subtitle: parsed.data.subtitle || null,
                meta_description: parsed.data.meta_description || excerpt.substring(0, 160),
                target_keywords: JSON.stringify(parsed.data.target_keywords || []),
                category: parsed.data.category || this.getCategoryFromSegment(customerSegment),
                customer_segment: customerSegment,
                pain_level: painLevel,
                topics: JSON.stringify(topics),
                excerpt,
                content: htmlContent,
                read_time: readTime,
                publish_date: parsed.data.publish_date || new Date().toISOString().split('T')[0],
                roi,
                problems_solved: JSON.stringify(problems),
                wayfair_solutions: JSON.stringify(solutions),
                metrics: JSON.stringify(parsed.data.metrics || {}),
                potential_savings: parsed.data.potential_savings || null,
                implementation_time: parsed.data.implementation_time || null,
                roi_timeframe: parsed.data.roi_timeframe || null,
                file_source: filename,
                word_count: wordCount
            };
            
            // Insert into database
            await this.insertArticle(articleData);
            
            this.stats.successful++;
            console.log(`✅ Success: ${title.substring(0, 60)}...`);
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
        }
    }

    extractTitleFromContent(content) {
        // Look for markdown h1 title
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
        
        // Look for first significant line
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            return lines[0].replace(/^#+\s*/, '').trim();
        }
        
        return null;
    }

    generateExcerpt(content) {
        // Remove markdown formatting and get first meaningful paragraph
        const cleaned = content
            .replace(/^#+\s+.+$/gm, '') // Remove headers
            .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
            .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
            .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
            .replace(/\n\s*\n/g, '\n') // Remove extra newlines
            .trim();
        
        const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        if (sentences.length > 0) {
            let excerpt = sentences[0].trim();
            if (sentences.length > 1 && excerpt.length < 100) {
                excerpt += '. ' + sentences[1].trim();
            }
            return excerpt.substring(0, 300) + (excerpt.length > 300 ? '...' : '');
        }
        
        return 'Professional insights and solutions for commercial furniture procurement and design optimization.';
    }

    getCategoryFromSegment(segment) {
        const categoryMap = {
            'interior-designers': 'Interior Designers',
            'contractors': 'Contractors',
            'office-procurement': 'Office Procurement',
            'accommodations': 'Accommodations',
            'education': 'Education',
            'foodservice': 'Foodservice',
            'property-management': 'Property Management'
        };
        
        return categoryMap[segment] || 'General';
    }

    async insertArticle(data) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO articles (
                    slug, title, subtitle, meta_description, target_keywords,
                    category, customer_segment, pain_level, topics, excerpt,
                    content, read_time, publish_date, roi, problems_solved,
                    wayfair_solutions, metrics, potential_savings, 
                    implementation_time, roi_timeframe, file_source, word_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                data.slug, data.title, data.subtitle, data.meta_description, 
                data.target_keywords, data.category, data.customer_segment, 
                data.pain_level, data.topics, data.excerpt, data.content, 
                data.read_time, data.publish_date, data.roi, data.problems_solved, 
                data.wayfair_solutions, data.metrics, data.potential_savings, 
                data.implementation_time, data.roi_timeframe, data.file_source, 
                data.word_count
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }

    async migrate() {
        try {
            const files = await this.initialize();
            
            // Process files in batches to avoid overwhelming the system
            const batchSize = 5;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                await Promise.all(batch.map(file => this.processFile(file)));
                
                // Brief pause between batches
                if (i + batchSize < files.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            await this.finalize();
            
        } catch (error) {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        }
    }

    async finalize() {
        // Get final statistics
        return new Promise((resolve) => {
            this.db.get("SELECT COUNT(*) as total FROM articles", (err, row) => {
                if (!err && row) {
                    console.log('\n📊 Migration Complete!');
                    console.log('==========================================');
                    console.log(`📄 Files processed: ${this.stats.processed}`);
                    console.log(`✅ Successfully migrated: ${this.stats.successful}`);
                    console.log(`❌ Errors: ${this.stats.errors}`);
                    console.log(`📚 Total articles in database: ${row.total}`);
                    console.log('==========================================\n');
                }
                
                this.db.close();
                resolve();
            });
        });
    }
}

// Run migration if called directly
if (require.main === module) {
    const migrator = new ArticleMigrator();
    migrator.migrate().catch(console.error);
}

module.exports = ArticleMigrator; 