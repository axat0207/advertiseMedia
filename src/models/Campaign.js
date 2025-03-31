const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    advertiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaignName: {
        type: String,
        required: true
    },
    campaignDescription: {
        type: String,
        required: true
    },
    campaignType: {
        type: String,
        enum: ['BANNER', 'FEATURED', 'INTERACTIVE'],
        required: true
    },
    headline: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    callToAction: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAUSED', 'COMPLETED'],
        default: 'ACTIVE'
    },
    analytics: {
        impressions: {
            type: Number,
            default: 0
        },
        clicks: {
            type: Number,
            default: 0
        },
        ctr: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Calculate CTR before saving
campaignSchema.pre('save', function(next) {
    if (this.analytics.impressions > 0) {
        this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
    }
    next();
});

module.exports = mongoose.model('Campaign', campaignSchema); 