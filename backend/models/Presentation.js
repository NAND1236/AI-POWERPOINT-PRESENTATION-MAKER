/**
 * Presentation Model
 * MongoDB schema for storing generated presentations
 */

const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    slideTitle: {
        type: String,
        required: true,
        trim: true
    },
    points: [{
        type: String,
        trim: true
    }]
}, { _id: false });

const presentationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Presentation title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slides: [slideSchema],
    sourceType: {
        type: String,
        enum: ['text', 'pdf', 'url', 'topic'],
        required: true
    },
    sourceContent: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    aiEnhanced: {
        type: Boolean,
        default: true
    },
    slideCount: {
        type: Number,
        default: 5,
        min: 1,
        max: 20
    },
    metadata: {
        originalFileName: String,
        originalUrl: String,
        topic: String,
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
presentationSchema.index({ user: 1, createdAt: -1 });
presentationSchema.index({ title: 'text' });

/**
 * Static method to get presentations by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of presentations to return
 * @returns {Array} Array of presentations
 */
presentationSchema.statics.getByUser = async function(userId, limit = 10) {
    return await this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-sourceContent');
};

const Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = Presentation;
