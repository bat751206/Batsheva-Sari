const User = require("../models/users")

const getAllUsers = async (req,res)=>{
    const users= await User.find()
    res.json(users)
}

const getUserById = async (req,res) =>{
    const {id}= req.params
    const user= await User.findById(id)
    res.json(user)
}

const updateUser = async (req,res) =>{
    const {id,username,password} =req.body
    if(!id){
        return res.send("id is required")
    }
    let user= await User.findById(id)
    user.username=username
    user.password=password
    await user.save()
    res.json(user) 
}

const deleteUser= async (req,res) =>{
    const {id}=req.params
    console.log(id)
    const user=await User.findById(id)
    console.log(user);
    
    await user.deleteOne()
    res.send("erased")
}



module.exports = { getAllUsers, getUserById,updateUser,deleteUser}