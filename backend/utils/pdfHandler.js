/**
 * PDF Handler Utility
 * Extract text from PDF files using pdf-parse
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Object} Extracted text and metadata
 */
const extractTextFromBuffer = async (pdfBuffer) => {
    try {
        const data = await pdfParse(pdfBuffer);
        
        return {
            success: true,
            text: data.text,
            numPages: data.numpages,
            info: {
                title: data.info?.Title || '',
                author: data.info?.Author || '',
                subject: data.info?.Subject || '',
                keywords: data.info?.Keywords || ''
            }
        };
    } catch (error) {
        console.error('PDF Parse Error:', error.message);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
};

/**
 * Extract text from PDF file path
 * @param {string} filePath - Path to PDF file
 * @returns {Object} Extracted text and metadata
 */
const extractTextFromFile = async (filePath) => {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('PDF file not found');
        }

        // Read file buffer
        const pdfBuffer = fs.readFileSync(filePath);
        
        return await extractTextFromBuffer(pdfBuffer);
    } catch (error) {
        console.error('PDF File Read Error:', error.message);
        throw new Error(`Failed to read PDF file: ${error.message}`);
    }
};

/**
 * Clean extracted PDF text
 * Remove extra whitespace, fix line breaks, etc.
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanExtractedText = (text) => {
    if (!text) return '';

    return text
        // Replace multiple newlines with double newline
        .replace(/\n{3,}/g, '\n\n')
        // Replace multiple spaces with single space
        .replace(/[ \t]+/g, ' ')
        // Fix broken words (hyphenation at line breaks)
        .replace(/(\w)-\n(\w)/g, '$1$2')
        // Remove form feed characters
        .replace(/\f/g, '\n\n')
        // Trim each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Remove empty lines at start/end
        .trim();
};

/**
 * Convert extracted text to basic slide structure
 * Used when AI enhancement is disabled
 * @param {string} text - Extracted text
 * @param {number} slideCount - Target number of slides
 * @returns {Object} Presentation structure
 */
const textToBasicSlides = (text, slideCount = 5) => {
    const cleanText = cleanExtractedText(text);
    
    // Split text into paragraphs
    const paragraphs = cleanText
        .split(/\n\n+/)
        .filter(p => p.trim().length > 20);

    // Calculate paragraphs per slide
    const paragraphsPerSlide = Math.ceil(paragraphs.length / slideCount);
    
    const slides = [];
    let currentSlide = 1;

    for (let i = 0; i < paragraphs.length && slides.length < slideCount; i += paragraphsPerSlide) {
        const slideParas = paragraphs.slice(i, i + paragraphsPerSlide);
        
        // Extract first sentence as title or use generic title
        const firstPara = slideParas[0] || '';
        const firstSentence = firstPara.split(/[.!?]/)[0];
        const slideTitle = firstSentence.length > 10 && firstSentence.length < 100
            ? firstSentence.trim()
            : `Section ${currentSlide}`;

        // Convert paragraphs to bullet points
        const points = slideParas
            .flatMap(p => {
                // Split long paragraphs into sentences
                const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 10);
                return sentences.slice(0, 5);
            })
            .slice(0, 5)
            .map(point => point.trim());

        if (points.length > 0) {
            slides.push({
                slideTitle,
                points
            });
        }

        currentSlide++;
    }

    // Ensure we have at least one slide
    if (slides.length === 0) {
        slides.push({
            slideTitle: 'Content Overview',
            points: [cleanText.substring(0, 200) + '...']
        });
    }

    return {
        title: 'Extracted Content',
        slides
    };
};

/**
 * Delete uploaded file after processing
 * @param {string} filePath - Path to file to delete
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
    }
};

module.exports = {
    extractTextFromBuffer,
    extractTextFromFile,
    cleanExtractedText,
    textToBasicSlides,
    deleteFile
};
