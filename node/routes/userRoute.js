const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
// מוודא שרק מנהל קיים יוכל ליצור חשבון מנהל נוסף.
const verifyRoles = require("../middleware/verifyRoles")

// יוצר מנהל; verifyJWT כבר רץ ברמת השרת לפני הנתיב הזה.
router.post("/admin", verifyRoles, userController.createAdmin)
router.get("/",userController.getAllUsers)
router.get("/:id",userController.getUserById)
router.put("/",userController.updateUser)
router.delete("/:id",userController.deleteUser)


module.exports = router