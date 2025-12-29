/**
 * Generate Routes
 * Handles presentation generation endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    generateFromText,
    generateFromPDF,
    generateFromURL,
    generateFromTopic,
    getUserPresentations,
    getPresentationById,
    deletePresentation,
    exportToPowerPoint,
    getExportThemes
} = require('../controllers/generateController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

/**
 * Multer configuration for PDF uploads
 * Store in memory for processing
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

/**
 * @route   POST /api/generate/text
 * @desc    Generate presentation from text
 * @access  Private (optional auth - saves if authenticated)
 */
router.post('/text', optionalAuth, generateFromText);

/**
 * @route   POST /api/generate/pdf
 * @desc    Generate presentation from PDF
 * @access  Private (optional auth - saves if authenticated)
 */
router.post('/pdf', optionalAuth, upload.single('pdf'), generateFromPDF);

/**
 * @route   POST /api/generate/url
 * @desc    Generate presentation from URL
 * @access  Private (optional auth - saves if authenticated)
 */
router.post('/url', optionalAuth, generateFromURL);

/**
 * @route   POST /api/generate/topic
 * @desc    Generate presentation from topic
 * @access  Private (optional auth - saves if authenticated)
 */
router.post('/topic', optionalAuth, generateFromTopic);

/**
 * @route   GET /api/generate/presentations
 * @desc    Get all user presentations
 * @access  Private
 */
router.get('/presentations', protect, getUserPresentations);

/**
 * @route   GET /api/generate/presentations/:id
 * @desc    Get single presentation
 * @access  Private
 */
router.get('/presentations/:id', protect, getPresentationById);

/**
 * @route   DELETE /api/generate/presentations/:id
 * @desc    Delete presentation
 * @access  Private
 */
router.delete('/presentations/:id', protect, deletePresentation);

/**
 * @route   POST /api/generate/export
 * @desc    Export presentation to PowerPoint
 * @access  Public (presentation data sent in body)
 */
router.post('/export', exportToPowerPoint);

/**
 * @route   GET /api/generate/themes
 * @desc    Get available export themes
 * @access  Public
 */
router.get('/themes', getExportThemes);

module.exports = router;
