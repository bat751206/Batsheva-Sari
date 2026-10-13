const Incomes = require("../models/incomes")

const createNewIncome = async (req, res) => {
    const {date,sum,paymentType,renter } = req.body
    if (!date || !sum ) {
        return res.send("date and sum is required")
    }
    const income = await Incomes.create({date,sum,paymentType,renter })
    res.json(income)
}

const getAllIncomes = async (req,res)=>{
    const incomes= await Incomes.find()
    res.json(incomes)
}

const getIncomeById = async (req,res) =>{
    const {id}= req.params
    const income= await Incomes.findById(id)
    res.json(income)
}

const updateIncome = async (req,res) =>{
    const {id,date,sum,paymentType,renter} =req.body
    if(!id){
        return res.send("id is required")
    }
    let income= await Incomes.findById(id)
   
    income.date=date
    income.sum=sum
    if(!Incomes.paymentType.find(paymentType)){
        
    }
    income.paymentType=paymentType
    income.renter=renter
    await income.save()
    res.json(income) 
}

const deleteIncome= async (req,res) =>{
    const {id}=req.params
    const income=await Incomes.findById(id)
    await income.deleteOne()
    res.send("erased")
}



module.exports = { createNewIncome ,getAllIncomes, getIncomeById,updateIncome,deleteIncome}