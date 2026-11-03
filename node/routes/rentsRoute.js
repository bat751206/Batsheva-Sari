const express = require("express")
const router = express.Router()
const rentController = require("../controllers/rentsController")
const verifyRoles = require("../middleware/verifyRoles")
const verifyJWT = require("../middleware/verifyJWT")

router.post("/",verifyJWT,verifyRoles,rentController.createNewRent )
router.get("/",rentController.getAllRents)
router.get("/nearest",rentController.getNearestRent)
router.get("/:id",rentController.getRentById)
router.put("/",verifyJWT,verifyRoles,rentController.updateRent)
router.delete("/:id",verifyJWT,verifyRoles,rentController.deleteRent)
router.put("/payment",verifyJWT,verifyRoles,rentController.paymentUpdateRent)
router.put("/advance",verifyJWT,verifyRoles,rentController.advanceUpdateRent)

module.exports = router