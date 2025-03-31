const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['USER', 'ADVERTISER', 'ADMIN'],
        default: 'USER'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 