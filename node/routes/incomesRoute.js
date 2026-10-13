const express = require("express")
const router = express.Router()
const incomeController = require("../controllers/incomesController")

router.post("/",incomeController.createNewIncome )
router.get("/",incomeController.getAllIncomes)
router.get("/:id",incomeController.getIncomeById)
router.put("/",incomeController.updateIncome)
router.delete("/:id",incomeController.deleteIncome)


module.exports = router