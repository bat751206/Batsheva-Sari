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
        type:String,
        default:0
    },
    numOfNights:{
        type:Number,
        required:true
    },
    sumPayment:{
        type:Number,
        required:true
    }
}, {
    timestamps: true
})

module.exports = rentSchema