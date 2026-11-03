const express = require("express")
const router = express.Router()
const todoController = require("../controllers/todosController")
const verifyRoles = require("../middleware/verifyRoles")
const verifyJWT = require("../middleware/verifyJWT")

router.post("/",verifyJWT,verifyRoles,todoController.createNewTodo )
router.get("/",todoController.getAllTodos)
router.get("/:id",todoController.getTodoById)
router.put("/",todoController.updateTodo)
router.put("/show",verifyJWT,verifyRoles,todoController.changeDisplay)
router.delete("/:id",verifyJWT,verifyRoles,todoController.deleteTodo)


module.exports = router