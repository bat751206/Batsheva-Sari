const Rents = require("../models/rents")

const createNewRent = async (req, res) => {
    const {date,numOfBeds,numOfBabyBeds,numOfNights,renter,chekPikadon,tivuch,sumPayment}= req.body
    if (!date || !numOfBeds||!numOfNights||!sumPayment ) {
        return res.send("date and numOfBeds and numOfNights andsumPayment is required")
    }
    const rent = await Rents.create({date,numOfBeds,numOfBabyBeds,numOfNights,renter,chekPikadon,tivuch,sumPayment})
    res.json(rent)
}

const getAllRents = async (req,res)=>{
    const rents= await Rents.find()
    res.json(rents)
}

const getRentById = async (req,res) =>{
    const {id}= req.params
    const rent= await Rents.findById(id)
    res.json(rent)
}

const updateRent = async (req,res) =>{
    const {id,date,numOfBeds,numOfBabyBeds,numOfNights,renter,chekPikadon,tivuch,sumPayment} =req.body
    if(!id){
        return res.send("id is required")
    }
    let rent= await Rents.findById(id)
   
    rent.date=date
    rent.numOfBeds=numOfBeds
    rent.numOfBabyBeds=numOfBabyBeds
    rent.numOfNights=numOfNights
    rent.renter=renter
    rent.chekPikadon=chekPikadon
    rent.tivuch=tivuch
    rent.sumPayment=sumPayment
    await rent.save()
    res.json(rent) 
}

const deleteRent= async (req,res) =>{
    const {id}=req.params
    const rent=await Rents.findById(id)
    await rent.deleteOne()
    res.send("erased")
}



module.exports = { createNewRent ,getAllRents, getRentById,updateRent,deleteRent}

