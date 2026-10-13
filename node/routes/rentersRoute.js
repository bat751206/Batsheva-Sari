const express = require("express")
const router = express.Router()
const renterController = require("../controllers/rentersController")

router.post("/",renterController.createNewRenter )
router.get("/",renterController.getAllRenters)
router.get("/:id",renterController.getRenterById)
router.put("/",renterController.updateRenter)
router.delete("/:id",renterController.deleteRenter)


module.exports = router