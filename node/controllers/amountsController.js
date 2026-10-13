const Amounts = require("../models/amounts")

const createNewAmount = async (req, res) => {
    const { product, proAmount } = req.body
    if (!product || !proAmount) {
        return res.send("product and amount is required")
    }
    const amount = await Amounts.create({ product, proAmount })
    res.json(amount)
}

const getAllAmounts = async (req, res) => {
    const amounts = await Amounts.find()
    res.json(amounts)
}

const getAmountById = async (req, res) => {
    const { id } = req.params
    const amount = await Amounts.findById(id)
    res.json(amount)
}

const increaseAmount = async (req, res) => {
    const { product, addAmount } = req.body
    if (!product || !addAmount) {
        return res.send("product and amount is required")
    }
    const id = await getIdByName(product)
    if (id === -1) {
        const amount = await Amounts.create({ product, proAmount:Number(addAmount) })
        return res.json(amount)
    }
    let amount = await Amounts.findById(id)
    amount.proAmount += Number(addAmount)
    await amount.save()
    res.json(amount)
}

const decreaseAmount = async (req, res) => {
    const { product, lessAmount } = req.body
    if (!product || !lessAmount) {
        return res.send("product and amount is required")
    }
    const id = await getIdByName(product)
    if (id === -1) {
        return res.send("product is not in stock")
    }
    let amount = await Amounts.findById(id)
    amount.proAmount -= Number(lessAmount)
    await amount.save()
    res.json(amount)
}

const deleteAmount = async (req, res) => {
    const { id } = req.params
    const amount = await Amounts.findById(id)
    await amount.deleteOne()
    res.send("erased")
}

const getIdByName = async (name) => {
    const p = await Amounts.findOne({ product: name })
    if (!p)
        return -1
    return p._id



}




module.exports = { createNewAmount, getAllAmounts, getAmountById, deleteAmount, increaseAmount, decreaseAmount, getIdByName }