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
    getCampaignAnalytics
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
 *           enum: [ACTIVE, PAUSED, COMPLETED]
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
 * /api/campaigns/{id}:
 *   put:
 *     summary: Update campaign
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
 *       content:
 *         multipart/form-data:
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 */
router.put('/:id', isAuth, checkRole(['ADVERTISER']), upload.single('image'), updateCampaign);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
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
 *         description: Campaign deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 */
router.delete('/:id', isAuth, checkRole(['ADVERTISER']), deleteCampaign);

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
router.get('/:id/analytics', isAuth, checkRole(['ADVERTISER']), getCampaignAnalytics);

module.exports = router; 