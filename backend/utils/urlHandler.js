/**
 * URL Handler Utility
 * Scrape and extract content from web pages
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch and parse webpage content
 * @param {string} url - URL to scrape
 * @returns {Object} Extracted content
 */
const scrapeUrl = async (url) => {
    try {
        // Validate URL
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error('Invalid URL protocol. Use HTTP or HTTPS.');
        }

        // Fetch webpage
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 15000,
            maxRedirects: 5
        });

        // Load HTML into cheerio
        const $ = cheerio.load(response.data);

        // Extract page title
        const pageTitle = $('title').text().trim() || 
                         $('meta[property="og:title"]').attr('content') || 
                         $('h1').first().text().trim() ||
                         'Untitled Page';

        // Extract meta description
        const metaDescription = $('meta[name="description"]').attr('content') ||
                               $('meta[property="og:description"]').attr('content') ||
                               '';

        // Remove unwanted elements
        $('script, style, nav, header, footer, aside, .sidebar, .advertisement, .ads, .comments, .social-share, noscript, iframe').remove();

        // Extract main content
        let mainContent = '';

        // Try to find main content area
        const mainSelectors = ['article', 'main', '.content', '.post-content', '.entry-content', '#content', '.article-body'];
        
        for (const selector of mainSelectors) {
            const element = $(selector);
            if (element.length && element.text().trim().length > 200) {
                mainContent = extractTextFromElement($, element);
                break;
            }
        }

        // Fallback to body content
        if (!mainContent) {
            mainContent = extractTextFromElement($, $('body'));
        }

        // Extract headings for structure
        const headings = [];
        $('h1, h2, h3').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 0 && text.length < 200) {
                headings.push({
                    level: el.tagName.toLowerCase(),
                    text
                });
            }
        });

        // Extract list items
        const listItems = [];
        $('ul li, ol li').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 10 && text.length < 500) {
                listItems.push(text);
            }
        });

        return {
            success: true,
            url,
            title: pageTitle,
            description: metaDescription,
            content: cleanContent(mainContent),
            headings: headings.slice(0, 20),
            listItems: listItems.slice(0, 50)
        };
    } catch (error) {
        console.error('URL Scraping Error:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            throw new Error('Website not found. Please check the URL.');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. The website may be slow or unavailable.');
        }
        if (error.response?.status === 403) {
            throw new Error('Access forbidden. The website may be blocking automated requests.');
        }
        if (error.response?.status === 404) {
            throw new Error('Page not found. Please check the URL.');
        }
        
        throw new Error(`Failed to scrape URL: ${error.message}`);
    }
};

/**
 * Extract clean text from a cheerio element
 * @param {Object} $ - Cheerio instance
 * @param {Object} element - Cheerio element
 * @returns {string} Extracted text
 */
const extractTextFromElement = ($, element) => {
    const texts = [];

    element.find('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 0) {
            texts.push(text);
        }
    });

    return texts.join('\n\n');
};

/**
 * Clean extracted content
 * @param {string} content - Raw content
 * @returns {string} Cleaned content
 */
const cleanContent = (content) => {
    if (!content) return '';

    return content
        // Remove multiple spaces
        .replace(/[ \t]+/g, ' ')
        // Remove multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        // Remove common UI text
        .replace(/\b(cookie|privacy|subscribe|newsletter|sign up|log in|loading)\b.*?\n/gi, '')
        // Trim lines
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        // Final trim
        .trim();
};

/**
 * Convert scraped content to basic slide structure
 * Used when AI enhancement is disabled
 * @param {Object} scrapedData - Scraped webpage data
 * @param {number} slideCount - Target number of slides
 * @returns {Object} Presentation structure
 */
const scrapedToBasicSlides = (scrapedData, slideCount = 5) => {
    const { title, description, content, headings, listItems } = scrapedData;
    const slides = [];

    // Title slide with description
    slides.push({
        slideTitle: title || 'Overview',
        points: description 
            ? [description]
            : [content.split('\n')[0] || 'Content from web page']
    });

    // Create slides from headings if available
    if (headings.length > 0) {
        const slidesFromHeadings = Math.min(headings.length, slideCount - 1);
        
        for (let i = 0; i < slidesFromHeadings; i++) {
            const heading = headings[i];
            
            // Find content after this heading
            const headingIndex = content.indexOf(heading.text);
            let nextHeadingIndex = content.length;
            
            if (headings[i + 1]) {
                nextHeadingIndex = content.indexOf(headings[i + 1].text);
            }
            
            const sectionContent = content.substring(headingIndex + heading.text.length, nextHeadingIndex);
            const points = sectionContent
                .split(/[.\n]+/)
                .filter(s => s.trim().length > 20 && s.trim().length < 300)
                .slice(0, 5)
                .map(s => s.trim());

            if (points.length > 0) {
                slides.push({
                    slideTitle: heading.text,
                    points
                });
            }
        }
    }

    // Fill remaining slides with list items or paragraphs
    if (slides.length < slideCount && listItems.length > 0) {
        const itemsPerSlide = Math.ceil(listItems.length / (slideCount - slides.length));
        
        for (let i = 0; i < listItems.length && slides.length < slideCount; i += itemsPerSlide) {
            const slideItems = listItems.slice(i, i + itemsPerSlide);
            
            if (slideItems.length > 0) {
                slides.push({
                    slideTitle: `Key Points ${slides.length}`,
                    points: slideItems.slice(0, 5)
                });
            }
        }
    }

    // Ensure we have at least the requested number of slides
    while (slides.length < slideCount) {
        const paragraphs = content.split('\n\n');
        const startIndex = slides.length * 2;
        const points = paragraphs
            .slice(startIndex, startIndex + 5)
            .filter(p => p.length > 20)
            .map(p => p.substring(0, 200) + (p.length > 200 ? '...' : ''));

        if (points.length === 0) break;

        slides.push({
            slideTitle: `Section ${slides.length + 1}`,
            points
        });
    }

    return {
        title: title || 'Web Content Presentation',
        slides: slides.slice(0, slideCount)
    };
};

module.exports = {
    scrapeUrl,
    cleanContent,
    scrapedToBasicSlides
};
