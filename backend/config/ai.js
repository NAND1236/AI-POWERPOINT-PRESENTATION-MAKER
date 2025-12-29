/**
 * AI Configuration
 * Setup for OpenAI API
 */

/**
 * System prompt for AI presentation generation
 * Ensures consistent JSON output format
 */
const SYSTEM_PROMPT = `You are a professional presentation designer and subject matter expert.
Your task is to generate comprehensive, detailed presentation slides in JSON format only.

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Follow the exact structure provided
3. Create DETAILED, COMPREHENSIVE, and INFORMATIVE content
4. Each slide MUST have 5-7 detailed bullet points
5. Each bullet point should be a complete sentence with specific information, facts, or insights
6. Include statistics, examples, and real-world applications where relevant
7. Content should be educational and provide real value to the audience
8. Avoid generic or vague statements - be specific and informative
9. Each bullet point should be 15-30 words long with meaningful content

OUTPUT FORMAT (STRICT):
{
  "title": "Comprehensive Presentation Title",
  "slides": [
    {
      "slideTitle": "Descriptive Slide Title",
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

Remember: Quality over brevity. Each slide should educate and inform the audience thoroughly.`;

/**
 * Generate presentation using OpenAI API
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
- Each slide must have 5-7 detailed bullet points
- Each bullet point should be a complete, informative sentence (15-30 words)
- Include specific facts, statistics, examples, and real-world applications
- Make the content educational and valuable for the audience
- Avoid generic statements - be specific and detailed

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
        const presentation = parseAIResponse(responseText);
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
 * Main function to generate presentation using OpenAI
 * @param {string} content - Content to convert to slides
 * @param {number} slideCount - Number of slides to generate
 * @returns {Object} Generated presentation JSON
 */
const generatePresentation = async (content, slideCount = 5) => {
    return await generateWithOpenAI(content, slideCount);
};

module.exports = {
    generatePresentation,
    generateWithOpenAI,
    SYSTEM_PROMPT
};
