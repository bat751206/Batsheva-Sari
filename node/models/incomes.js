const mongoose = require('mongoose')

const incomesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    sum:{
        type:Number,
        required:true
    },
    paymentType:{
        type:String,
        enum:['מזומן','העברה',"צ'ק"]
    },
    renter:{
        type:mongoose.ObjectId,
        ref:'Renter'
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('income', incomesSchema)