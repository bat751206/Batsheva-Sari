const Outcomes = require("../models/outcomes")

const createNewOutcome = async (req, res) => {
    const {date,sum,paymentType,description,} = req.body
    if (!date || !sum || !description) {
        return res.send("date and sum and description is required")
    }
    const outcome = await Outcomes.create({date,sum,paymentType,description })
    res.json(outcome)
}

const getAllOutcomes = async (req,res)=>{
    const outcomes= await Outcomes.find()
    res.json(outcomes)
}

const getOutcomeById = async (req,res) =>{
    const {id}= req.params
    const outcome= await Outcomes.findById(id)
    res.json(outcome)
}

const updateOutcome = async (req,res) =>{
    const {id,date,sum,paymentType,description} =req.body
    if(!id){
        return res.send("id is required")
    }
    let outcome= await Outcomes.findById(id)
   
    outcome.date=date
    outcome.sum=sum
    outcome.paymentType=paymentType
    outcome.description=description
    await outcome.save()
    res.json(outcome) 
}

const deleteOutcome= async (req,res) =>{
    const {id}=req.params
    const outcome=await Outcomes.findById(id)
    await outcome.deleteOne()
    res.send("erased")
}



module.exports = { createNewOutcome ,getAllOutcomes, getOutcomeById,updateOutcome,deleteOutcome}