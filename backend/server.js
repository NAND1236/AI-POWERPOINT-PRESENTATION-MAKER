/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

const path = require('path');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Get port from environment
const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        const server = app.listen(PORT, () => {
            console.log('============================================');
            console.log(`🚀 AI Presentation API Server`);
            console.log('============================================');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Local: http://localhost:${PORT}`);
            console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
            console.log('============================================');
            console.log('📋 Available endpoints:');
            console.log('   POST /api/auth/signup');
            console.log('   POST /api/auth/login');
            console.log('   GET  /api/auth/me');
            console.log('   POST /api/generate/text');
            console.log('   POST /api/generate/pdf');
            console.log('   POST /api/generate/url');
            console.log('   POST /api/generate/topic');
            console.log('   GET  /api/generate/presentations');
            console.log('   POST /api/generate/export');
            console.log('   GET  /api/generate/themes');
            console.log('============================================');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('❌ Unhandled Promise Rejection:', err.message);
            // Close server & exit process
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('❌ Uncaught Exception:', err.message);
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('💤 Process terminated.');
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();
