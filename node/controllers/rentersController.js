const Renters = require("../models/renters")

const createNewRenter = async (req, res) => {
    const {name,phone, email,city} = req.body
    if ( !name ||!phone ) {
        return res.send("name and phone is required")
    }
    const renter = await Renters.create({name,phone, email,city })
    res.json(renter)
}

const getAllRenters = async (req,res)=>{
    const renters= await Renters.find()
    res.json(renters)
}

const getRenterById = async (req,res) =>{
    const {id}= req.params
    const renter= await Renters.findById(id)
    res.json(renter)
}

const updateRenter = async (req,res) =>{
    const {id,name,phone, email,city} =req.body
    if(!id){
        return res.send("id is required")
    }
    let renter= await Renters.findById(id)
   
    renter.name=name
    renter.phone=phone
    renter.email=email
    renter.city=city
    await renter.save()
    res.json(renter) 
}

const deleteRenter= async (req,res) =>{
    const {id}=req.params
    const renter=await Renters.findById(id)
    await renter.deleteOne()
    res.send("erased")
}



module.exports = { createNewRenter ,getAllRenters, getRenterById,updateRenter,deleteRenter}