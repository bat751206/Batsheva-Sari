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
        type:String,
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
    chekPikadon:{
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
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Rent', rentsSchema)