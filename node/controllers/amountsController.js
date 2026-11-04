const Amounts = require("../models/amounts")
// מייבא שליחת התראות למנהלים כאשר מוצר מגיע לכמות המינימלית.
const { notifyAdmins } = require("../services/emailNotifications")

const createNewAmount = async (req, res) => {
    const { product, proAmount } = req.body
    // מוודא שהמוצר והכמות תקינים ושהכמות אינה נמוכה מהמינימום המותר.
    if (!product || proAmount === undefined || !Number.isFinite(Number(proAmount)) || Number(proAmount) < 0) {
        return res.send("product and amount is required")
    }
    // יוצר את פריט המלאי לאחר בדיקת הנתונים.
    const amount = await Amounts.create({ product, proAmount })
    // שולח התראה אם הפריט נוצר כשהכמות שלו כבר במינימום, אפס.
    if (Number(amount.proAmount) === 0) {
        // מעביר למנהל את פרטי הפריט ואת קישור דף המלאי.
        await notifyAdmins({
            // מגדיר נושא שמבהיר שהמלאי אזל.
            subject: "המלאי אזל",
            // מציין את שם המוצר ואת הכמות המינימלית.
            message: `הכמות של ${amount.product} הגיעה למינימום (0).`,
            // מפנה את הנמען לדף המלאי במערכת.
            path: "/amount"
        })
    }
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
    // מחזיר שגיאה אם פריט המלאי נעלם בין החיפוש לעדכון.
    if (!amount) return res.status(404).json({ message: "המוצר לא נמצא במלאי" })
    // שומר את הכמות הקודמת כדי לזהות מעבר ממשי לאפס.
    const previousQuantity = Number(amount.proAmount)
    amount.proAmount -= Number(lessAmount)
    await amount.save()
    // מתריע רק כאשר הכמות ירדה מחיובית למינימום, ולא בעדכון חוזר שכבר נמצא באפס.
    if (previousQuantity > 0 && Number(amount.proAmount) === 0) {
        // מעביר למנהל את פרטי הפריט ואת קישור דף המלאי.
        await notifyAdmins({
            // מגדיר נושא שמבהיר שהמלאי אזל.
            subject: "המלאי אזל",
            // מציין את שם המוצר ואת הכמות המינימלית.
            message: `הכמות של ${amount.product} הגיעה למינימום (0).`,
            // מפנה את הנמען לדף המלאי במערכת.
            path: "/amount"
        })
    }
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