const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    
    password: {
        type: String,
        required: true
    },
    // שומר כתובת מייל אופציונלית בפורמט אחיד לצורך שליחת התראות.
    email: {
        type: String, // מגדיר את הכתובת כערך טקסט.
        trim: true, // מסיר רווחים מיותרים מסביב לכתובת.
        lowercase: true, // מאחיד את האותיות כדי להקל על חיפוש ושליחה.
        default: '' // מאפשר למשתמשים קיימים וחדשים להשאיר את השדה ריק.
    },
    // שומר אם המשתמש אישר במפורש לקבל התראות בדואר אלקטרוני.
    emailNotifications: {
        type: Boolean, // שומר את ההסכמה כערך אמת או שקר.
        default: false // משאיר התראות כבויות כל עוד המשתמש לא אישר אותן.
    },
    // מתעד מתי נשלח למשתמש אישור חד־פעמי על קבלת מיילים.
    emailConfirmationSentAt: {
        type: Date, // שומר את זמן השליחה כדי לזהות אם כבר נשלח אישור.
        default: null // מציין שעדיין לא נשלח אישור לחשבון חדש או קיים.
    },
    roles: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)