const Rents = require("../models/rents")
const { createNewRenter } = require("./rentersController")
const {addrentalToRenter} = require("./rentersController")



const createNewRent = async (req, res) => {
    const {date,numOfBeds,numOfBabyBeds,numOfNights,chekPikadon,tivuch,sumPayment,description}= req.body
    const { name, phone, email, city, advertisement}= req.body
    if (!date || !numOfBeds||!numOfNights||!sumPayment||!name||!phone ) {
        return res.send("date and numOfBeds and numOfNights and sumPayment is required")
    }
    if (Number.isNaN(new Date(date).getTime()) || !Number.isInteger(Number(numOfNights)) || Number(numOfNights) <= 0) {
        return res.status(400).json({ message: "date and numOfNights must be valid" })
    }
    if (!(await isDateAvailable(date, numOfNights))) {
        return res.status(409).json({ message: "התאריך הנבחר תפוס" })
    }
    // const date = new Date();
    // if(date.d)


        
    const renter=await createNewRenter( name, phone, email, city, advertisement)

    const rent = await Rents.create({ date, numOfBeds, numOfBabyBeds, numOfNights, renter: renter._id, chekPikadon, tivuch, sumPayment, description })
    await addrentalToRenter(renter._id,rent)
    res.json(rent)

}

const getAllRents = async (req,res)=>{
    const rents= await Rents.find().populate("renter", "name")
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
const isDateAvailable = async (date, numOfNights) => {
    const startDate = new Date(date)
    const nights = Number(numOfNights)

    if (Number.isNaN(startDate.getTime()) || !Number.isInteger(nights) || nights <= 0) {
        return false
    }

    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + nights)

    const existingRents = await Rents.find({ date: { $lt: endDate } })
        .select("date numOfNights")
        .lean()

    return !existingRents.some((rent) => {
        const existingStart = new Date(rent.date)
        const existingEnd = new Date(existingStart)
        existingEnd.setUTCDate(existingEnd.getUTCDate() + Number(rent.numOfNights))

        return existingStart < endDate && existingEnd > startDate
    })
}


module.exports = { createNewRent ,getAllRents, getRentById,updateRent,deleteRent}

