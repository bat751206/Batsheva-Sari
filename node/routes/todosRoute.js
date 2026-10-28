const express = require("express")
const router = express.Router()
const todoController = require("../controllers/todosController")
// const verifyJWT = require("../middleware/verifyJWT")
// router.use(verifyJWT)

router.post("/",todoController.createNewTodo )
router.get("/",todoController.getAllTodos)
router.get("/:id",todoController.getTodoById)
router.put("/",todoController.updateTodo)
router.put("/show",todoController.changeDisplay)
router.delete("/:id",todoController.deleteTodo)


module.exports = router