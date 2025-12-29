/**
 * Generate Controller
 * Handles presentation generation from various sources
 */

const Presentation = require('../models/Presentation');
const User = require('../models/User');
const { generatePresentation } = require('../config/ai');
const { extractTextFromBuffer, cleanExtractedText, textToBasicSlides, deleteFile } = require('../utils/pdfHandler');
const { scrapeUrl, scrapedToBasicSlides } = require('../utils/urlHandler');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Generate presentation from text input
 * @route   POST /api/generate/text
 * @access  Private
 */
const generateFromText = asyncHandler(async (req, res, next) => {
    const { text, slideCount = 5, enhance = true } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
        return next(new AppError('Please provide text content', 400));
    }

    if (text.length < 50) {
        return next(new AppError('Text content is too short. Please provide at least 50 characters.', 400));
    }

    if (text.length > 50000) {
        return next(new AppError('Text content is too long. Maximum 50,000 characters allowed.', 400));
    }

    // Validate slide count
    const slides = Math.min(Math.max(parseInt(slideCount) || 5, 1), 20);

    let presentation;

    try {
        // Generate presentation using AI
        presentation = await generatePresentation(text, slides);
    } catch (error) {
        console.error('AI Generation Error:', error.message);
        return next(new AppError(`Failed to generate presentation: ${error.message}`, 500));
    }

    // Save to database if user is authenticated
    if (req.user) {
        const savedPresentation = await Presentation.create({
            title: presentation.title,
            slides: presentation.slides,
            sourceType: 'text',
            sourceContent: text.substring(0, 5000), // Store first 5000 chars
            user: req.user.id,
            aiEnhanced: enhance,
            slideCount: slides
        });

        // Add to user's presentations
        await User.findByIdAndUpdate(req.user.id, {
            $push: { presentations: savedPresentation._id }
        });
    }

    // Return response in strict JSON format
    res.status(200).json({
        title: presentation.title,
        slides: presentation.slides
    });
});

/**
 * @desc    Generate presentation from PDF upload
 * @route   POST /api/generate/pdf
 * @access  Private
 */
const generateFromPDF = asyncHandler(async (req, res, next) => {
    // Check if file was uploaded
    if (!req.file) {
        return next(new AppError('Please upload a PDF file', 400));
    }

    const { slideCount = 5, enhance = true } = req.body;
    const enhanceWithAI = enhance === 'true' || enhance === true;

    // Validate slide count
    const slides = Math.min(Math.max(parseInt(slideCount) || 5, 1), 20);

    let extractedData;

    try {
        // Extract text from PDF
        extractedData = await extractTextFromBuffer(req.file.buffer);
    } catch (error) {
        return next(new AppError(`Failed to extract text from PDF: ${error.message}`, 400));
    }

    // Clean extracted text
    const cleanedText = cleanExtractedText(extractedData.text);

    if (cleanedText.length < 50) {
        return next(new AppError('PDF contains insufficient text content', 400));
    }

    let presentation;

    try {
        if (enhanceWithAI) {
            // Generate with AI enhancement
            presentation = await generatePresentation(cleanedText, slides);
        } else {
            // Convert to basic slides without AI
            presentation = textToBasicSlides(cleanedText, slides);
            
            // Try to use PDF title if available
            if (extractedData.info?.title) {
                presentation.title = extractedData.info.title;
            }
        }
    } catch (error) {
        console.error('Presentation Generation Error:', error.message);
        
        // Fallback to basic slides if AI fails
        presentation = textToBasicSlides(cleanedText, slides);
    }

    // Save to database if user is authenticated
    if (req.user) {
        const savedPresentation = await Presentation.create({
            title: presentation.title,
            slides: presentation.slides,
            sourceType: 'pdf',
            sourceContent: cleanedText.substring(0, 5000),
            user: req.user.id,
            aiEnhanced: enhanceWithAI,
            slideCount: slides,
            metadata: {
                originalFileName: req.file.originalname,
                generatedAt: new Date()
            }
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { presentations: savedPresentation._id }
        });
    }

    // Return response in strict JSON format
    res.status(200).json({
        title: presentation.title,
        slides: presentation.slides
    });
});

/**
 * @desc    Generate presentation from URL
 * @route   POST /api/generate/url
 * @access  Private
 */
const generateFromURL = asyncHandler(async (req, res, next) => {
    const { url, slideCount = 5, enhance = true } = req.body;
    const enhanceWithAI = enhance === 'true' || enhance === true;

    // Validate URL
    if (!url || url.trim().length === 0) {
        return next(new AppError('Please provide a URL', 400));
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        return next(new AppError('Please provide a valid URL', 400));
    }

    // Validate slide count
    const slides = Math.min(Math.max(parseInt(slideCount) || 5, 1), 20);

    let scrapedData;

    try {
        // Scrape webpage content
        scrapedData = await scrapeUrl(url);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }

    if (!scrapedData.content || scrapedData.content.length < 50) {
        return next(new AppError('Could not extract sufficient content from the URL', 400));
    }

    let presentation;

    try {
        if (enhanceWithAI) {
            // Generate with AI enhancement
            const contentForAI = `Title: ${scrapedData.title}\n\nDescription: ${scrapedData.description}\n\nContent:\n${scrapedData.content}`;
            presentation = await generatePresentation(contentForAI, slides);
        } else {
            // Convert to basic slides without AI
            presentation = scrapedToBasicSlides(scrapedData, slides);
        }
    } catch (error) {
        console.error('Presentation Generation Error:', error.message);
        
        // Fallback to basic slides if AI fails
        presentation = scrapedToBasicSlides(scrapedData, slides);
    }

    // Save to database if user is authenticated
    if (req.user) {
        const savedPresentation = await Presentation.create({
            title: presentation.title,
            slides: presentation.slides,
            sourceType: 'url',
            sourceContent: scrapedData.content.substring(0, 5000),
            user: req.user.id,
            aiEnhanced: enhanceWithAI,
            slideCount: slides,
            metadata: {
                originalUrl: url,
                generatedAt: new Date()
            }
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { presentations: savedPresentation._id }
        });
    }

    // Return response in strict JSON format
    res.status(200).json({
        title: presentation.title,
        slides: presentation.slides
    });
});

/**
 * @desc    Generate presentation from topic
 * @route   POST /api/generate/topic
 * @access  Private
 */
const generateFromTopic = asyncHandler(async (req, res, next) => {
    const { topic, slideCount = 5, audience = 'general', style = 'professional' } = req.body;

    // Validate topic
    if (!topic || topic.trim().length === 0) {
        return next(new AppError('Please provide a topic', 400));
    }

    if (topic.length < 3) {
        return next(new AppError('Topic is too short. Please provide a more descriptive topic.', 400));
    }

    if (topic.length > 500) {
        return next(new AppError('Topic is too long. Maximum 500 characters allowed.', 400));
    }

    // Validate slide count
    const slides = Math.min(Math.max(parseInt(slideCount) || 5, 1), 20);

    // Build prompt for AI
    const topicPrompt = `Create a comprehensive presentation about: "${topic}"

Target Audience: ${audience}
Style: ${style}
Number of Slides: ${slides}

Please create an engaging and informative presentation that covers the key aspects of this topic.
Include an introduction slide, main content slides, and a conclusion/summary slide.
Each slide should have 3-5 clear, concise bullet points.`;

    let presentation;

    try {
        // Generate presentation using AI
        presentation = await generatePresentation(topicPrompt, slides);
    } catch (error) {
        console.error('AI Generation Error:', error.message);
        return next(new AppError(`Failed to generate presentation: ${error.message}`, 500));
    }

    // Save to database if user is authenticated
    if (req.user) {
        const savedPresentation = await Presentation.create({
            title: presentation.title,
            slides: presentation.slides,
            sourceType: 'topic',
            sourceContent: topic,
            user: req.user.id,
            aiEnhanced: true,
            slideCount: slides,
            metadata: {
                topic,
                audience,
                style,
                generatedAt: new Date()
            }
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { presentations: savedPresentation._id }
        });
    }

    // Return response in strict JSON format
    res.status(200).json({
        title: presentation.title,
        slides: presentation.slides
    });
});

/**
 * @desc    Get user's presentations
 * @route   GET /api/generate/presentations
 * @access  Private
 */
const getUserPresentations = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const presentations = await Presentation.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-sourceContent');

    const total = await Presentation.countDocuments({ user: req.user.id });

    res.status(200).json({
        success: true,
        data: {
            presentations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
});

/**
 * @desc    Get single presentation by ID
 * @route   GET /api/generate/presentations/:id
 * @access  Private
 */
const getPresentationById = asyncHandler(async (req, res, next) => {
    const presentation = await Presentation.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!presentation) {
        return next(new AppError('Presentation not found', 404));
    }

    res.status(200).json({
        title: presentation.title,
        slides: presentation.slides
    });
});

/**
 * @desc    Delete presentation
 * @route   DELETE /api/generate/presentations/:id
 * @access  Private
 */
const deletePresentation = asyncHandler(async (req, res, next) => {
    const presentation = await Presentation.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!presentation) {
        return next(new AppError('Presentation not found', 404));
    }

    await presentation.deleteOne();

    // Remove from user's presentations array
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { presentations: req.params.id }
    });

    res.status(200).json({
        success: true,
        message: 'Presentation deleted successfully'
    });
});

/**
 * @desc    Export presentation to PowerPoint
 * @route   POST /api/generate/export
 * @access  Public
 */
const { generatePowerPoint, getAvailableThemes } = require('../utils/pptxExport');

const exportToPowerPoint = asyncHandler(async (req, res, next) => {
    const { presentation, theme = 'professional' } = req.body;

    // Validate input
    if (!presentation) {
        return next(new AppError('Please provide presentation data', 400));
    }

    if (!presentation.title || !presentation.slides) {
        return next(new AppError('Invalid presentation format. Must have title and slides.', 400));
    }

    try {
        // Generate PowerPoint file
        const pptxBuffer = await generatePowerPoint(presentation, theme);

        // Set response headers for file download
        const filename = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_presentation.pptx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pptxBuffer.length);

        // Send the file
        res.send(pptxBuffer);
    } catch (error) {
        console.error('PowerPoint Export Error:', error.message);
        return next(new AppError(`Failed to export presentation: ${error.message}`, 500));
    }
});

/**
 * @desc    Get available export themes
 * @route   GET /api/generate/themes
 * @access  Public
 */
const getExportThemes = asyncHandler(async (req, res, next) => {
    const themes = getAvailableThemes();
    res.status(200).json({
        success: true,
        themes
    });
});

module.exports = {
    generateFromText,
    generateFromPDF,
    generateFromURL,
    generateFromTopic,
    getUserPresentations,
    getPresentationById,
    deletePresentation,
    exportToPowerPoint,
    getExportThemes
};
