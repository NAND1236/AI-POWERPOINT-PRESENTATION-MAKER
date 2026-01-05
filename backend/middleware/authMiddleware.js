/**
 * Authentication Middleware
 * JWT token verification for protected routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 * Attaches user object to request if valid
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // DEBUG: Log incoming authorization header
        console.log('[AUTH] Headers received:', {
            hasAuth: !!req.headers.authorization,
            authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'NONE'
        });

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            console.log('[AUTH] No token in request');
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        console.log('[AUTH] Token found:', token.substring(0, 20) + '...');

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token invalid or expired'
            });
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

/**
 * Optional authentication - Attach user if token exists, but don't block
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token invalid, but continue without user
                console.log('Optional auth - invalid token, continuing without user');
            }
        }

        next();
    } catch (error) {
        next();
    }
};

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

module.exports = {
    protect,
    optionalAuth,
    generateToken
};
