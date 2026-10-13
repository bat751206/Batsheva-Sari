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
    const {id,name,username,email,address,phone} =req.body
    if(!id || !name){
        return res.send("id and name is required")
    }
    let user= await User.findById(id)
    user.name=name
    user.username=username
    user.email=email
    user.address=address
    user.phone=phone
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