const express = require("express")
const router = express.Router()
const outcomeController = require("../controllers/outcomesController")
const verifyJWT = require("../middleware/verifyJWT")
const verifyRoles = require("../middleware/verifyRoles")

router.post("/",outcomeController.createNewOutcome )
router.get("/",verifyRoles,outcomeController.getAllOutcomes)
router.get("/:id",verifyRoles,outcomeController.getOutcomeById)
router.put("/",verifyRoles,outcomeController.updateOutcome)
router.delete("/:id",verifyRoles,outcomeController.deleteOutcome)


module.exports = router