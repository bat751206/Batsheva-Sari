const express = require("express")
const router = express.Router()
const rentController = require("../controllers/rentsController")

router.post("/",rentController.createNewRent )
router.get("/",rentController.getAllRents)
router.get("/nearest",rentController.getNearestRent)
router.get("/:id",rentController.getRentById)
router.put("/",rentController.updateRent)
router.delete("/:id",rentController.deleteRent)
router.put("/payment",rentController.paymentUpdateRent)
router.put("/advance",rentController.advanceUpdateRent)

module.exports = router