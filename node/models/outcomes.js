
const mongoose = require('mongoose')

const outcomesSchema = new mongoose.Schema({
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
        enum:['מזומן','העברה',"צ'ק",'אשראי','אשראי דיירקט']
    },
    description:{
        type:String,
        required:true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Outcome', outcomesSchema)