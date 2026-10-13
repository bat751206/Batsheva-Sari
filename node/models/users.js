const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        lowercase: true
    },
    address: {
        type: {
            city: String,
            street: String,
            house: Number
        }
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    phone: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)