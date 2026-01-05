/**
 * AI Configuration
 * Setup for Google Gemini API
 */

const GEMINI_API_KEY = 'AIzaSyBRgpMjZGu-bxy1mrEVl9J6jbFuGyHhiYo';

/**
 * System prompt for AI presentation generation
 * Ensures consistent JSON output format with image keywords
 */
const SYSTEM_PROMPT = `You are a professional presentation designer and subject matter expert.
Your task is to generate comprehensive, detailed presentation slides in JSON format only.

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Follow the exact structure provided
3. Create DETAILED, COMPREHENSIVE, and INFORMATIVE content
4. Each slide MUST have 4-5 detailed bullet points
5. Each bullet point should be a complete sentence with specific information, facts, or insights
6. Include statistics, examples, and real-world applications where relevant
7. Content should be educational and provide real value to the audience
8. Avoid generic or vague statements - be specific and informative
9. Each bullet point should be 15-30 words long with meaningful content
10. IMPORTANT: Include an "imageKeyword" for each slide - a 2-4 word search term for finding a relevant professional image

OUTPUT FORMAT (STRICT):
{
  "title": "Comprehensive Presentation Title",
  "slides": [
    {
      "slideTitle": "Descriptive Slide Title",
      "imageKeyword": "relevant image search term",
      "points": [
        "Detailed point with specific information, facts, statistics, or examples that provides real value to the audience",
        "Another comprehensive point explaining concepts thoroughly with relevant context and applications",
        "In-depth explanation covering key aspects with practical insights and real-world relevance",
        "Specific point with data, research findings, or expert insights to support the topic",
        "Actionable or insightful point that gives the audience something to remember or apply"
      ]
    }
  ]
}

EXAMPLE OF GOOD CONTENT:
- BAD: "AI is used in healthcare"
- GOOD: "Artificial Intelligence in healthcare has reduced diagnostic errors by 35% according to a 2024 Stanford study, with machine learning algorithms now capable of detecting early-stage cancers from medical imaging with 94% accuracy"

EXAMPLE OF IMAGE KEYWORDS:
- For a slide about "Introduction to Machine Learning": imageKeyword: "machine learning technology"
- For a slide about "Climate Change Effects": imageKeyword: "climate change environment"
- For a slide about "Business Strategy": imageKeyword: "business strategy meeting"

Remember: Quality over brevity. Each slide should educate and inform the audience thoroughly.`;

/**
 * Fetch relevant image - uses multiple reliable sources
 * Returns HIGH RESOLUTION images for premium presentations (1920x1080)
 * @param {string} keyword - Search keyword for image
 * @returns {string|null} Direct image URL
 */
const fetchImageForSlide = async (keyword) => {
    const cleanKeyword = keyword.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    // Create a consistent seed from keyword for reproducible images
    const keywordHash = cleanKeyword.toLowerCase().split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    
    // Map common keywords to relevant high-res Unsplash image IDs for professional presentations
    // Using 1920x1080 for full-slide backgrounds and large images
    const imageMapping = {
        'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80',
        'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop&q=80',
        'computer': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&h=1080&fit=crop&q=80',
        'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80',
        'server': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80',
        'cable': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&h=1080&fit=crop&q=80',
        'fiber': 'https://images.unsplash.com/photo-1516044734145-07ca8eef8731?w=1920&h=1080&fit=crop&q=80',
        'wireless': 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=1920&h=1080&fit=crop&q=80',
        'signal': 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=1920&h=1080&fit=crop&q=80',
        'security': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1920&h=1080&fit=crop&q=80',
        'cloud': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&h=1080&fit=crop&q=80',
        'internet': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&q=80',
        'communication': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop&q=80',
        'digital': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&h=1080&fit=crop&q=80',
        'hardware': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&h=1080&fit=crop&q=80',
        'infrastructure': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80',
        'transmission': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&h=1080&fit=crop&q=80',
        'physical': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80',
        'layer': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80',
        'protocol': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&h=1080&fit=crop&q=80',
        'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&q=80',
        'team': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80',
        'challenge': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&q=80',
        'solution': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&q=80',
        'future': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&q=80',
        'innovation': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=1080&fit=crop&q=80',
        'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop&q=80',
        'machine': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1920&h=1080&fit=crop&q=80',
        'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&q=80',
        'research': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&h=1080&fit=crop&q=80'
    };
    
    // Check if any keyword matches our mapping
    const lowerKeyword = cleanKeyword.toLowerCase();
    for (const [key, url] of Object.entries(imageMapping)) {
        if (lowerKeyword.includes(key)) {
            console.log(`Found mapped image for "${keyword}" (matched: ${key})`);
            return url;
        }
    }
    
    // Fallback: Use a curated list of high-resolution tech/business images
    const fallbackImages = [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop&q=80', // servers
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop&q=80', // circuit
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&h=1080&fit=crop&q=80', // cables
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&q=80', // earth tech
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&h=1080&fit=crop&q=80', // code
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80', // data
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop&q=80', // communication
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1920&h=1080&fit=crop&q=80'  // security
    ];
    
    const index = Math.abs(keywordHash) % fallbackImages.length;
    console.log(`Using fallback image for "${keyword}" (index: ${index})`);
    return fallbackImages[index];
};

/**
 * Fetch images for all slides in parallel
 * @param {Array} slides - Array of slide objects with imageKeyword
 * @returns {Array} Slides with imageUrl added
 */
const fetchImagesForSlides = async (slides) => {
    const imagePromises = slides.map(async (slide) => {
        if (slide.imageKeyword) {
            const imageUrl = await fetchImageForSlide(slide.imageKeyword);
            return { ...slide, imageUrl };
        }
        return slide;
    });
    
    return Promise.all(imagePromises);
};

/**
 * Generate presentation using Google Gemini API
 * @param {string} content - Content to convert to slides
 * @param {number} slideCount - Number of slides to generate
 * @returns {Object} Generated presentation JSON
 */
const generateWithGemini = async (content, slideCount = 5) => {
    const userPrompt = `Create a professional, comprehensive presentation with ${slideCount} slides based on the following content:

${content}

REQUIREMENTS:
- Each slide must have 4-5 detailed bullet points
- Each bullet point should be a complete, informative sentence (15-30 words)
- Include specific facts, statistics, examples, and real-world applications
- Make the content educational and valuable for the audience
- Avoid generic statements - be specific and detailed
- Include an imageKeyword for each slide (2-4 words for finding relevant images)

Remember: Return ONLY valid JSON in the specified format. No markdown, no explanations.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\n${userPrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    topP: 0.95
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text.trim();
        
        // Parse and validate JSON response
        let presentation = parseAIResponse(responseText);
        
        // Fetch images for each slide
        console.log('Fetching images for slides...');
        presentation.slides = await fetchImagesForSlides(presentation.slides);
        
        return presentation;
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        throw new Error(`Gemini API Error: ${error.message}`);
    }
};

/**
 * Generate presentation using OpenAI API (fallback)
 * @param {string} content - Content to convert to slides
 * @param {number} slideCount - Number of slides to generate
 * @returns {Object} Generated presentation JSON
 */
const generateWithOpenAI = async (content, slideCount = 5) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const userPrompt = `Create a professional, comprehensive presentation with ${slideCount} slides based on the following content:

${content}

REQUIREMENTS:
- Each slide must have 4-5 detailed bullet points
- Each bullet point should be a complete, informative sentence (15-30 words)
- Include specific facts, statistics, examples, and real-world applications
- Make the content educational and valuable for the audience
- Avoid generic statements - be specific and detailed
- Include an imageKeyword for each slide (2-4 words for finding relevant images)

Remember: Return ONLY valid JSON in the specified format. No markdown, no explanations.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content.trim();
        
        // Parse and validate JSON response
        let presentation = parseAIResponse(responseText);
        
        // Fetch images for each slide
        presentation.slides = await fetchImagesForSlides(presentation.slides);
        
        return presentation;
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        throw new Error(`OpenAI API Error: ${error.message}`);
    }
};

/**
 * Parse AI response and extract valid JSON
 * Handles cases where AI might include markdown code blocks
 * @param {string} responseText - Raw response from AI
 * @returns {Object} Parsed presentation JSON
 */
const parseAIResponse = (responseText) => {
    let jsonString = responseText;

    // Remove markdown code blocks if present
    if (jsonString.includes('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonString.includes('```')) {
        jsonString = jsonString.replace(/```\n?/g, '');
    }

    // Trim whitespace
    jsonString = jsonString.trim();

    try {
        const parsed = JSON.parse(jsonString);
        
        // Validate structure
        if (!parsed.title || !Array.isArray(parsed.slides)) {
            throw new Error('Invalid presentation structure');
        }

        // Validate each slide
        parsed.slides.forEach((slide, index) => {
            if (!slide.slideTitle || !Array.isArray(slide.points)) {
                throw new Error(`Invalid slide structure at index ${index}`);
            }
        });

        return parsed;
    } catch (error) {
        console.error('JSON Parse Error:', error.message);
        console.error('Raw response:', responseText);
        throw new Error('Failed to parse AI response as valid JSON');
    }
};

/**
 * Main function to generate presentation using Gemini (primary) or OpenAI (fallback)
 * @param {string} content - Content to convert to slides
 * @param {number} slideCount - Number of slides to generate
 * @returns {Object} Generated presentation JSON with images
 */
const generatePresentation = async (content, slideCount = 5) => {
    // Try Gemini first (primary)
    try {
        console.log('Generating presentation with Google Gemini...');
        return await generateWithGemini(content, slideCount);
    } catch (geminiError) {
        console.error('Gemini failed, trying OpenAI fallback:', geminiError.message);
        
        // Fallback to OpenAI if available
        if (process.env.OPENAI_API_KEY) {
            return await generateWithOpenAI(content, slideCount);
        }
        
        throw geminiError;
    }
};

module.exports = {
    generatePresentation,
    generateWithGemini,
    generateWithOpenAI,
    fetchImageForSlide,
    fetchImagesForSlides,
    SYSTEM_PROMPT,
    GEMINI_API_KEY
};
