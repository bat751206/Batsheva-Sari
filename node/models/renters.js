const mongoose = require('mongoose')
const rentSchema = require('./rent')

const rentersSchema = new mongoose.Schema({
    id:{
        type:String,
        index:true,
        uniqe:true
    },
    name: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required:true
    },
    email:{
        type:String
    
    },
    city:{
        type:String        
    },
    rentsList:{
        type:[rentSchema],
        default:[]
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Renter', rentersSchema)