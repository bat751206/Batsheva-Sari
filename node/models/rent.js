const mongoose = require('mongoose')

const rentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    numOfBeds:{
        type:Number,
        required:true
    },
    numOfBabyBeds:{
        type:Number,
        default:0,
        max:2
    },
    numOfNights:{
        type:Number,
        required:true
    },
    sumPayment:{
        type:Number,
        required:true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

module.exports = rentSchema