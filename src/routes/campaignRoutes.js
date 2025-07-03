const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuth, checkRole } = require('../middlewares/isAuth');
const {
    createCampaign,
    getAllCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    getDashboardStats,
    getCampaignAnalytics,
    updateCampaignStatus,
    updateCampaignAnalytics,
    updateCampaignDetails
} = require('../controllers/campaignController');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       required:
 *         - campaignName
 *         - campaignDescription
 *         - campaignType
 *         - headline
 *         - body
 *         - callToAction
 *       properties:
 *         campaignName:
 *           type: string
 *         campaignDescription:
 *           type: string
 *         campaignType:
 *           type: string
 *           enum: [BANNER, FEATURED, INTERACTIVE]
 *         headline:
 *           type: string
 *         body:
 *           type: string
 *         callToAction:
 *           type: string
 *         imageUrl:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, PAUSED, COMPLETED]
 *         analytics:
 *           type: object
 *           properties:
 *             impressions:
 *               type: number
 *             clicks:
 *               type: number
 *             ctr:
 *               type: number
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management endpoints
 */

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - campaignName
 *               - campaignDescription
 *               - campaignType
 *               - headline
 *               - body
 *               - callToAction
 *               - image
 *             properties:
 *               campaignName:
 *                 type: string
 *               campaignDescription:
 *                 type: string
 *               campaignType:
 *                 type: string
 *                 enum: [BANNER, FEATURED, INTERACTIVE]
 *               headline:
 *                 type: string
 *               body:
 *                 type: string
 *               callToAction:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', isAuth, checkRole(['ADVERTISER']), upload.single('image'), createCampaign);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 */
router.get('/', getAllCampaigns);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign details
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', getCampaign);

/**
 * @swagger
 * /api/campaigns/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeCampaigns:
 *                   type: number
 *                 totalImpressions:
 *                   type: number
 *                 overallCTR:
 *                   type: number
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       performance:
 *                         type: object
 *                         properties:
 *                           impressions:
 *                             type: number
 *                           clicks:
 *                             type: number
 *                           ctr:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/dashboard/stats', isAuth, checkRole(['ADVERTISER']), getDashboardStats);

/**
 * @swagger
 * /api/campaigns/{id}/analytics:
 *   get:
 *     summary: Get campaign analytics
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaignName:
 *                   type: string
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     impressions:
 *                       type: number
 *                     clicks:
 *                       type: number
 *                     ctr:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 */
router.get('/:id/analytics', isAuth, getCampaignAnalytics);

/**
 * @swagger
 * /api/campaigns/{id}/analytics:
 *   put:
 *     summary: Update campaign analytics
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - impressions
 *               - clicks
 *               - ctr
 *             properties:
 *               impressions:
 *                 type: number
 *               clicks:
 *                 type: number
 *               ctr:
 *                 type: number
 *     responses:
 *       200:
 *         description: Campaign analytics updated successfully
 *       400:
 *         description: Invalid analytics format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 */
router.put('/:id/analytics',  updateCampaignAnalytics);

/**
 * @swagger
 * /api/campaigns/{id}/status:
 *   put:
 *     summary: Update campaign status (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACTIVE, PAUSED, COMPLETED]
 *     responses:
 *       200:
 *         description: Campaign status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Campaign not found
 */
router.put('/:id/status', isAuth, updateCampaignStatus);

/**
 * @swagger
 * /api/campaigns/{id}/details:
 *   put:
 *     summary: Update campaign details (JSON, no image)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignName:
 *                 type: string
 *               campaignDescription:
 *                 type: string
 *               campaignType:
 *                 type: string
 *                 enum: [BANNER, FEATURED, INTERACTIVE]
 *               headline:
 *                 type: string
 *               body:
 *                 type: string
 *               callToAction:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACTIVE, PAUSED, COMPLETED]
 *     responses:
 *       200:
 *         description: Campaign details updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 */
router.put('/:id/details', isAuth, checkRole(['ADVERTISER', 'ADMIN']), updateCampaignDetails);

module.exports = router;