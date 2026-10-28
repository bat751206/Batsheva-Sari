const Todo = require("../models/todos")

const createNewTodo = async (req, res) => {
    const { title, isTemporary } = req.body
    const cleanTitle = typeof title === "string" ? title.trim() : ""
    if (!cleanTitle) {
        return res.send("title is required")
    }
    let todo= await Todo.findOne({ title: cleanTitle })
    if(todo){
        return res.send("title must be uniqe")
    }
    const temporary = isTemporary === true
    todo = await Todo.create({
        title: cleanTitle,
        isTemporary: temporary,
        show: !temporary
    })
    res.json(todo)
}

const getAllTodos = async (req,res)=>{
    const todos= await Todo.find()
    res.json(todos)
}

const getTodoById = async (req,res) =>{
    const {id}= req.params
    const todo= await Todo.findById(id)
    res.json(todo)
}

const updateTodo = async (req,res) =>{
    const {title} =req.body
    if( !title){
        return res.send("title is required")
    }
    let todo= await Todo.findOne({title})
    todo.status=!todo.status
    await todo.save()
    res.json(todo) 
}

const changeDisplay = async (req,res) =>{
    const {title} =req.body
    if( !title){
        return res.send("title is required")
    }
    let todo= await Todo.findOne({title})
    todo.show=!todo.show
    await todo.save()
    res.json(todo) 
}

const deleteTodo= async (req,res) =>{
    const {id}=req.params
    const todo=await Todo.findById(id)
    await todo.deleteOne()
    res.send("erased")
}



module.exports = { createNewTodo ,getAllTodos, getTodoById,updateTodo,deleteTodo,changeDisplay}