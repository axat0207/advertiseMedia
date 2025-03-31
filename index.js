require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./src/routes/authRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AdvertiseMedia API',
            version: '1.0.0',
            description: 'API documentation for AdvertiseMedia',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3001}`,
                description: 'Development server',
            },
            {
                url: 'https://advertisemedia.onrender.com',
                description: 'Production server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

console.log('Attempting to connect to MongoDB...');
// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
            console.log('Routes configured:');
            console.log('- POST /api/auth/register');
            console.log('- POST /api/auth/login');
            console.log('- GET /health');
            console.log('- All campaign routes under /api/campaigns');
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }); 