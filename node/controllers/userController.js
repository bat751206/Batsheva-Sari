const User = require("../models/users")
// מייבא הצפנת סיסמאות לפני שמירת משתמש חדש.
const bcrypt = require("bcrypt")

// יוצר חשבון מנהל חדש מתוך בקשה של מנהל מורשה.
const createAdmin = async (req, res) => {
    // קורא את פרטי ההתחברות שנשלחו מהטופס.
    const { username, password } = req.body
    // מנקה רווחים ומוודא ששם המשתמש התקבל כמחרוזת.
    const cleanUsername = typeof username === "string" ? username.trim() : ""
    // מנקה ומנרמל את כתובת המייל האופציונלית.
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    // מקבל הסכמה למייל רק כשהערך שנשלח הוא true במפורש.
    const emailNotifications = req.body.emailNotifications === true

    // דורש שם משתמש וסיסמה באורך מינימלי סביר.
    if (!cleanUsername || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ message: "יש להזין שם משתמש וסיסמה באורך של 8 תווים לפחות" })
    }
    // דוחה כתובת מייל לא תקינה אם הוזנה.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "כתובת המייל אינה תקינה" })
    }
    // מונע אישור התראות כאשר לא הוזנה כתובת.
    if (emailNotifications && !email) {
        return res.status(400).json({ message: "יש להזין מייל כדי לאשר קבלת התראות" })
    }

    // בודק ששם המשתמש אינו תפוס לפני יצירת החשבון.
    const duplicate = await User.findOne({ username: cleanUsername }).lean()
    // מחזיר שגיאת התנגשות אם כבר קיים משתמש בשם הזה.
    if (duplicate) return res.status(409).json({ message: "שם המשתמש כבר קיים" })

    // מצפין את הסיסמה לפני כתיבתה למסד הנתונים.
    const hashedPassword = await bcrypt.hash(password, 10)
    // יוצר את החשבון עם תפקיד מנהל שנקבע בשרת ולא מהבקשה.
    const user = await User.create({
        // שומר את שם המשתמש לאחר ניקוי רווחים.
        username: cleanUsername,
        // שומר רק את הגיבוב המוצפן של הסיסמה.
        password: hashedPassword,
        // מעניק הרשאת מנהל מתוך לוגיקת השרת בלבד.
        roles: "Admin",
        // שומר כתובת מייל אם נמסרה.
        email,
        // שומר את הסכמת המייל המפורשת.
        emailNotifications
    })

    // מחזיר רק פרטי חשבון בטוחים, ללא הסיסמה או הגיבוב שלה.
    return res.status(201).json({
        // מחזיר את מזהה המשתמש שנוצר.
        id: user._id,
        // מחזיר את שם המשתמש לתצוגת הצלחה.
        username: user.username,
        // מאשר שהחשבון נוצר עם תפקיד מנהל.
        roles: user.roles,
        // מחזיר את כתובת המייל האופציונלית.
        email: user.email,
        // מחזיר את מצב הסכמת ההתראות.
        emailNotifications: user.emailNotifications
    })
}

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



// חושף לבקרי הנתיב את פעולות המשתמשים ואת יצירת המנהלים.
module.exports = { getAllUsers, getUserById, updateUser, deleteUser, createAdmin }