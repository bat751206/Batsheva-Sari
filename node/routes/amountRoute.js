const express = require("express")
const router = express.Router()
const amountController = require("../controllers/amountsController")

router.post("/",amountController.createNewAmount )
router.get("/",amountController.getAllAmounts)
router.get("/:id",amountController.getAmountById)
router.put("/add",amountController.increaseAmount)
router.put("/use",amountController.decreaseAmount)

router.delete("/:id",amountController.deleteAmount)


module.exports = router