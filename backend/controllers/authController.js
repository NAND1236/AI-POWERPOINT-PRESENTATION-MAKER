/**
 * Authentication Controller
 * Handles user signup and login
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email, and password', 400));
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Please provide a valid email address', 400));
    }

    // Validate password length
    if (password.length < 6) {
        return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Check if user exists
    if (!user) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        }
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .populate('presentations', 'title createdAt sourceType');

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                presentationCount: user.presentations?.length || 0
            }
        }
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) {
        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return next(new AppError('Please provide a valid email address', 400));
        }
        
        // Check if email is already taken
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: req.user.id }
        });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }
        
        updateFields.email = email.toLowerCase();
    }

    // Update user
    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateFields,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: { token }
    });
});

module.exports = {
    signup,
    login,
    getMe,
    updateMe,
    changePassword
};
