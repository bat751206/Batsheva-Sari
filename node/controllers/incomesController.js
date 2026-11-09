const Incomes = require("../models/incomes")
// מייבא את מודל השוכרים כדי לצרף שם להתראת תשלום.
const Renters = require("../models/renters")
// מייבא שליחת התראות למנהלים לאחר רישום הכנסה חדשה.
const { notifyAdmins, sendPaymentNotification } = require("../services/emailNotifications")

const createNewIncome = async (req, res) => {
    const { date, sum, paymentType, renter, rental, incomeType } = req.body
    if (!date || !sum) {
        return res.send("date and sum is required")
    }
   
    if (new Date(date).getTime() - new Date().getTime()>0)
    {
        return res.send("תאריך לא תקין נסה שוב")
    }
        // שומר את ההכנסה החדשה במסד לפני שליחת ההתראה.
        const income = await Incomes.create({ date, sum, paymentType, renter, rental, incomeType })
    // מודיע למנהלים שנרשמה הכנסה חדשה.
    await notifyAdmins({
        // מגדיר כותרת שמציינת שהתקבלה הכנסה.
        subject: "נכנסה הכנסה חדשה",
        // מציג את הסכום ואת תאריך ההכנסה בפורמט ישראלי.
        message: `נרשמה הכנסה בסך ${income.sum} ₪ בתאריך ${new Date(income.date).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" })}.`,
        // מפנה את הנמען לדף ההכנסות.
        path: "/account/incomes"
    })
    res.json(income)
}

const getAllIncomes = async (req, res) => {
    const incomes = await Incomes.find().populate("renter", "name")
    res.json(incomes)
}

const getIncomeById = async (req, res) => {
    const { id } = req.params
    const income = await Incomes.findById(id)
    res.json(income)
}

const updateIncome = async (req, res) => {
    const { id, date, sum, paymentType, renter } = req.body
    if (!id) {
        return res.send("id is required")
    }
    let income = await Incomes.findById(id)
    if (!income) return res.status(404).json({ message: "ההכנסה לא נמצאה" })
    // מאתר את שם השוכר לפני עדכון רשומת ההכנסה.
    const paymentRenter = await Renters.findById(renter || income.renter).select("name").lean()

    income.date = date
    income.sum = sum
    if (!Incomes.paymentType.find(paymentType)) {

    }
    income.paymentType = paymentType
    income.renter = renter
    await income.save()
    // שולח את הנוסח על השכרה ששולמה רק עבור רשומת תשלום מלא ולא עבור מקדמה.
    if (income.incomeType !== "advance") {
        // מעביר להתראה את שם השוכר, תאריך ההכנסה והמשתמש המחובר.
        await sendPaymentNotification({ renterName: paymentRenter?.name, paymentDate: income.date, managerName: req.user?.username })
    }
    res.json(income)
}

const deleteIncome = async (req, res) => {
    const { id } = req.params
    const income = await Incomes.findById(id)
    await income.deleteOne()
    res.send("erased")
}



module.exports = { createNewIncome, getAllIncomes, getIncomeById, updateIncome, deleteIncome }