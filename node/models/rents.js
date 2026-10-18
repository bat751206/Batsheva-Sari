const mongoose = require('mongoose')

const rentsSchema = new mongoose.Schema({
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
        default:0
    },
    numOfNights:{
        type:Number,
        required:true
    },
    renter:{
        type:mongoose.ObjectId,
        ref:'Renter'
    },
    checkPikadon:{
        type:Boolean,
        default:false
    },
    tivuch:{
        type: Boolean,
        default:false
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

module.exports = mongoose.model('Rent', rentsSchema)