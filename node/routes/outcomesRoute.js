const express = require("express")
const router = express.Router()
const outcomeController = require("../controllers/outcomesController")

router.post("/",outcomeController.createNewOutcome )
router.get("/",outcomeController.getAllOutcomes)
router.get("/:id",outcomeController.getOutcomeById)
router.put("/",outcomeController.updateOutcome)
router.delete("/:id",outcomeController.deleteOutcome)


module.exports = router