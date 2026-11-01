const Renters = require("../models/renters")
const Rents = require("../models/rents")

const findRenterByNameAndPhone = async (name, phone) => Renters.findOne({
    name: name.trim(),
    phone: phone.trim()
})

const createNewRenter = async ( name, phone, email, city, advertisement) => {
    if (!name || !phone) {
        throw new Error("name and phone are required")
    }
    const existingRenter = await findRenterByNameAndPhone(name, phone)
    if (existingRenter) return existingRenter
    return Renters.create({ name, phone, email, city, advertisement })

}

const getAllRenters = async (req, res) => {
    const renters = await Renters.find()
    res.json(renters)
}

const getRenterById = async (req, res) => {
    const { id } = req.params
    const renter = await Renters.findById(id)
    res.json(renter)
}

const getRenterByNameAndPhone = async (req, res) => {
    const { name, phone } = req.query
    if (!name?.trim() || !phone?.trim()) {
        return res.status(400).json({ message: "name and phone are required" })
    }
    const renter = await findRenterByNameAndPhone(name, phone)
    res.json(renter ? {
        email: renter.email,
        city: renter.city,
        advertisement: renter.advertisement
    } : null)
}

const updateRenter = async (req, res) => {
    const { id, name, phone, email, city, advertisement } = req.body
    if (!id) {
        return res.send("id is required")
    }
    let renter = await Renters.findById(id)

    renter.name = name
    renter.phone = phone
    renter.email = email
    renter.city = city
    renter.advertisement = advertisement
    await renter.save()
    res.json(renter)
}
const addrentalToRenter = async (renterId, rent) => {
    const renter = await Renters.findById(renterId)
    renter.rentsList.push(rent)
    await renter.save()
}

const deleteRenter = async (req, res) => {
    const { id } = req.params
    const renter = await Renters.findById(id)
    await renter.deleteOne()
    res.send("erased")
}
const getIdByName = async (name) => {
    const r = await Renters.findOne({ name: name })
    if (!r)
        return -1
    return r._id

}




module.exports = { createNewRenter, getAllRenters, getRenterById, getRenterByNameAndPhone, updateRenter, deleteRenter, getIdByName, addrentalToRenter }