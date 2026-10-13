const mongoose = require('mongoose')

const amountSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    proAmount:{
        type: Number,
        required:true,
        min:0
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Amount', amountSchema)