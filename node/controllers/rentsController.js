const Rents = require("../models/rents")
const Renters = require("../models/renters")
const Incomes = require("../models/incomes")
// מייבא התראות למנהלים על תשלום חדש שנרשם להשכרה.
const { notifyAdmins } = require("../services/emailNotifications")
const { createNewRenter } = require("./rentersController")
const {addrentalToRenter} = require("./rentersController")



const createNewRent = async (req, res) => {
    const {date,numOfBeds,numOfBabyBeds,numOfNights,checkPikadon,tivuch,sumPayment,advance,advancePaymentType,description}= req.body
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

    const advanceAmount = Number.isFinite(Number(advance)) ? Number(advance) : Number(sumPayment) * 0.1
    const rent = await Rents.create({ date, numOfBeds, numOfBabyBeds, numOfNights, renter: renter._id, checkPikadon, tivuch, sumPayment, advance: advanceAmount, advancePaymentType: advancePaymentType || undefined, description })
    await addrentalToRenter(renter._id,rent)
    res.json(rent)

}

const getAllRents = async (req,res)=>{
    const rents= await Rents.find().populate("renter", "name phone email city advertisement")
    res.json(rents)
}

const getNearestRent = async (req, res) => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const rent = await Rents.findOne({ date: { $gte: today } })
        .sort({ date: 1 })
        .populate("renter", "name")
    res.json(rent)
}

const getRentById = async (req,res) =>{
    const {id}= req.params
    const rent= await Rents.findById(id)
    res.json(rent)
}

const updateRent = async (req,res) =>{
    const {id,date,numOfBeds,numOfBabyBeds,numOfNights,checkPikadon,tivuch,sumPayment,advance,advancePaymentType,description,name,phone,email,city,advertisement} =req.body
    if(!id){
        return res.status(400).json({ message: "id is required" })
    }
    const rent= await Rents.findById(id)
    if (!rent) return res.status(404).json({ message: "השכרה לא נמצאה" })
    if (!date || !Number.isInteger(Number(numOfBeds)) || Number(numOfBeds) < 1 || !Number.isInteger(Number(numOfNights)) || Number(numOfNights) < 1 || !Number.isFinite(Number(sumPayment)) || Number(sumPayment) < 0 || !String(name || '').trim() || !String(phone || '').trim()) {
        return res.status(400).json({ message: "יש למלא את כל שדות החובה בפרטים תקינים" })
    }
    if (Number.isNaN(new Date(date).getTime())) {
        return res.status(400).json({ message: "תאריך לא תקין" })
    }
    if (!(await isDateAvailable(date, numOfNights, id))) {
        return res.status(409).json({ message: "התאריך הנבחר תפוס" })
    }

    const previousSchedule = `${new Date(rent.date).toISOString().slice(0, 10)}:${rent.numOfNights}`
    const updatedSchedule = `${new Date(date).toISOString().slice(0, 10)}:${numOfNights}`
    const renterName = String(name).trim()
    const renterPhone = String(phone).trim()
    let renter = await Renters.findById(rent.renter)
    if (!renter || renter.name !== renterName || renter.phone !== renterPhone) {
        renter = await Renters.findOne({ name: renterName, phone: renterPhone })
    }
    if (!renter) renter = new Renters({ name: renterName, phone: renterPhone })
    renter.name = renterName
    renter.phone = renterPhone
    renter.email = String(email || '').trim()
    renter.city = String(city || '').trim()
    renter.advertisement = String(advertisement || '').trim()
    await renter.save()

    rent.date=date
    rent.numOfBeds=Number(numOfBeds)
    rent.numOfBabyBeds=Number(numOfBabyBeds) || 0
    rent.numOfNights=Number(numOfNights)
    if (previousSchedule !== updatedSchedule) rent.todoListActivated = false
    rent.renter=renter._id
    rent.checkPikadon=checkPikadon === true
    rent.tivuch=tivuch === true
    rent.sumPayment=Number(sumPayment)
    rent.advance=Number.isFinite(Number(advance)) ? Number(advance) : Number(sumPayment) * 0.1
    rent.advancePaymentType=advancePaymentType || undefined
    rent.description=String(description || '').trim()
    await rent.save()
    res.json(rent)
}
const paymentUpdateRent = async (req,res) =>{
    const {id,paymentType} =req.body
    if(!id){
        return res.send("id is required")
    }
    const rent= await Rents.findById(id)
    if (!rent) return res.status(404).json({ message: "השכרה לא נמצאה" })
    if (!paymentType) return res.status(400).json({ message: "יש לבחור אמצעי תשלום" })

    const fullIncomeAmount = Number(rent.sumPayment) * (rent.tivuch ? 0.85 : 1)
    // יוצר הכנסה רק אם עדיין לא נרשם תשלום מלא להשכרה זו.
    const paymentResult = await Incomes.updateOne(
        { rental: rent._id, incomeType: 'payment' },
        {
            $set: {
                date: new Date(),
                sum: fullIncomeAmount,
                paymentType,
                renter: rent.renter,
            },
            $setOnInsert: {
                rental: rent._id,
                incomeType: 'payment',
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    // שולח התראה רק כאשר נוצר רישום תשלום חדש ולא בעדכון של תשלום קיים.
    if (paymentResult.upsertedCount > 0) {
        // מודיע למנהלים על התשלום החדש ומקשר לדף ההכנסות.
        await notifyAdmins({
            // מגדיר כותרת שמבהירה שנכנס תשלום חדש.
            subject: "נכנס תשלום חדש",
            // מציג את סכום התשלום שנרשם.
            message: `נרשם תשלום חדש בסך ${fullIncomeAmount} ₪ עבור השכרה.`,
            // מפנה את הנמען לרשימת ההכנסות.
            path: "/account/incomes"
        })
    }
    await Incomes.deleteMany({ rental: rent._id, incomeType: 'advance' })
    rent.isPaid=true
    rent.paymentType=paymentType
    await rent.save()
    res.json(rent) 
}
const advanceUpdateRent = async (req,res) =>{
    const {id,advancePaymentType} =req.body
    if(!id){
        return res.send("id is required")
    }
    let rent= await Rents.findById(id)
    rent.paidAdvance=true
    rent.advancePaymentType=advancePaymentType
    await rent.save()
    res.json(rent) 
}

const deleteRent= async (req,res) =>{
    const {id}=req.params
    const rent=await Rents.findById(id)
    await rent.deleteOne()
    res.send("erased")
}
const isDateAvailable = async (date, numOfNights, excludeRentId = null) => {
    const startDate = new Date(date)
    const nights = Number(numOfNights)

    if (Number.isNaN(startDate.getTime()) || !Number.isInteger(nights) || nights <= 0) {
        return false
    }

    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + nights)

    const rentFilter = { date: { $lt: endDate } }
    if (excludeRentId) rentFilter._id = { $ne: excludeRentId }
    const existingRents = await Rents.find(rentFilter)
        .select("date numOfNights")
        .lean()

    return !existingRents.some((rent) => {
        const existingStart = new Date(rent.date)
        const existingEnd = new Date(existingStart)
        existingEnd.setUTCDate(existingEnd.getUTCDate() + Number(rent.numOfNights))

        return existingStart < endDate && existingEnd > startDate
    })
}


module.exports = { createNewRent ,getAllRents, getNearestRent, getRentById,updateRent,deleteRent,paymentUpdateRent,advanceUpdateRent}

