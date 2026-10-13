const express = require("express")
const router = express.Router()
const postController = require("../controllers/postsController")
const verifyJWT = require("../middleware/verifyJWT")

router.post("/",verifyJWT,postController.createNewPost )
router.get("/",verifyJWT,postController.getAllPosts)
router.get("/:id",verifyJWT,postController.getPostById)
router.put("/",verifyJWT,postController.updatePost)
router.delete("/:id",verifyJWT,postController.deletePost)


module.exports = router