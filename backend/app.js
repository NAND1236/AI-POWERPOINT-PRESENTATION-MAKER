/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const generateRoutes = require('./routes/generateRoutes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

/**
 * CORS Configuration
 * Allow requests from frontend
 */
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : true,  // Allow ALL origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware (development only)
 */
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        next();
    });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Presentation API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to AI Presentation Maker API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            generate: {
                text: 'POST /api/generate/text',
                pdf: 'POST /api/generate/pdf',
                url: 'POST /api/generate/url',
                topic: 'POST /api/generate/topic',
                presentations: 'GET /api/generate/presentations'
            }
        }
    });
});

/**
 * Error handling middleware
 */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
