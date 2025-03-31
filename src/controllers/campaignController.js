const Campaign = require('../models/Campaign');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Campaign
const createCampaign = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        const campaign = await Campaign.create({
            advertiser: req.user.userId,
            campaignName: req.body.campaignName,
            campaignDescription: req.body.campaignDescription,
            campaignType: req.body.campaignType,
            headline: req.body.headline,
            body: req.body.body,
            callToAction: req.body.callToAction,
            imageUrl: result.secure_url
        });

        res.status(201).json({
            message: 'Campaign created successfully',
            campaign
        });
    } catch (error) {
        console.error('Campaign creation error:', error);
        res.status(500).json({ message: 'Error creating campaign' });
    }
};

// Get All Campaigns
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate('advertiser', 'userId fullName companyName')
            .select('campaignName campaignType status analytics headline body callToAction imageUrl advertiser')
            .sort({ createdAt: -1 });
        
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Error fetching campaigns' });
    }
};

// Get Campaign Details
const getCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('advertiser', 'userId fullName companyName')
            .select('campaignName campaignType status analytics headline body callToAction imageUrl advertiser');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ message: 'Error fetching campaign' });
    }
};

// Update Campaign
const updateCampaign = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // If new image is uploaded
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.imageUrl = result.secure_url;
        }

        const campaign = await Campaign.findOneAndUpdate(
            { _id: req.params.id, advertiser: req.user.userId },
            updateData,
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({
            message: 'Campaign updated successfully',
            campaign
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating campaign' });
    }
};

// Delete Campaign
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndDelete({
            _id: req.params.id,
            advertiser: req.user.userId
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting campaign' });
    }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const activeCampaigns = await Campaign.countDocuments({
            advertiser: req.user.userId,
            status: 'ACTIVE'
        });

        const campaigns = await Campaign.find({ advertiser: req.user.userId });
        
        const totalImpressions = campaigns.reduce((sum, campaign) => 
            sum + campaign.analytics.impressions, 0);
        
        const totalClicks = campaigns.reduce((sum, campaign) => 
            sum + campaign.analytics.clicks, 0);
        
        const overallCTR = totalImpressions > 0 
            ? (totalClicks / totalImpressions) * 100 
            : 0;

        res.json({
            activeCampaigns,
            totalImpressions,
            overallCTR: overallCTR.toFixed(2),
            campaigns: campaigns.map(campaign => ({
                id: campaign._id,
                name: campaign.campaignName,
                type: campaign.campaignType,
                status: campaign.status,
                performance: {
                    impressions: campaign.analytics.impressions,
                    clicks: campaign.analytics.clicks,
                    ctr: campaign.analytics.ctr.toFixed(2)
                }
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// Get Campaign Analytics
const getCampaignAnalytics = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            advertiser: req.user.userId
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({
            campaignName: campaign.campaignName,
            analytics: {
                impressions: campaign.analytics.impressions,
                clicks: campaign.analytics.clicks,
                ctr: campaign.analytics.ctr.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaign analytics' });
    }
};

module.exports = {
    createCampaign,
    getAllCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    getDashboardStats,
    getCampaignAnalytics
}; 