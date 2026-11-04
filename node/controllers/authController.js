const User = require("../models/users")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// מייבא שליחת אישור חד־פעמי למשתמש שבחר לקבל התראות במייל.
const { sendEmailConfirmation } = require("../services/emailNotifications")

const login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const foundUser = await User.findOne({ username }).lean()
    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(401).json({ message: 'Unauthorized' })
    const userInfo = {
        _id: foundUser._id, 
        roles: foundUser.roles, 
        username: foundUser.username,
    }
    const accessToken = jwt.sign(userInfo,process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken:accessToken})
}


const register = async (req, res) => {
    const { username, password } = req.body
    // מקבל מייל רק אם הבקשה מכילה מחרוזת, ומאחד את הכתובת לאותיות קטנות.
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    // דורש אישור מפורש מסוג אמת במקום להסתמך על ערך כלשהו שנחשב חיובי.
    const emailNotifications = req.body.emailNotifications === true
    if ( !username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    // דוחה כתובת מייל לא תקינה לפני יצירת החשבון.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' })
    }
    // מונע שמירת הסכמה להתראות כשאין כתובת לשלוח אליה.
    if (emailNotifications && !email) {
        return res.status(400).json({ message: 'Email is required for email notifications' })
    }
    const duplicate = await User.findOne({ username: username }).lean()
    if (duplicate) {
        return res.status(409).json({ message: "Duplicate username" })
    }
    const hashedPwd = await bcrypt.hash(password, 10)
    // שומר את הגדרות המייל ומשאיר את התפקיד כברירת המחדל של משתמש רגיל.
    const userObject = { username, password: hashedPwd, email, emailNotifications }
    const user = await User.create(userObject)
    if (user) {
        // שולח אישור הרשמה למייל רק אם המשתמש סיפק כתובת והסכים לקבל הודעות.
        if (email && emailNotifications) {
            // מבקש מהשירות לשלוח הודעת אישור אחת לכתובת המשתמש.
            const confirmationSent = await sendEmailConfirmation(email)
            // שומר את זמן השליחה כדי שהכלי החד־פעמי לא ישלח הודעה כפולה.
            if (confirmationSent) {
                user.emailConfirmationSentAt = new Date()
                await user.save()
            }
        }
        return res.status(201).json({ message: `New user ${user.username} created` })
    }
    else {
        return res.status(400).json({ message: 'Invalid user received' })
    }
}

module.exports = { login, register }