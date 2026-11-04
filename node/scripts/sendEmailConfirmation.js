require("dotenv").config() // טוען משתני סביבה כדי להתחבר למסד ולשירות המייל.
const mongoose = require("mongoose") // מייבא את חיבור MongoDB.
const User = require("../models/users") // מייבא את מודל המשתמשים.
const { sendEmailConfirmation } = require("../services/emailNotifications") // מייבא את שליחת אישור המייל החד־פעמי.

const username = process.argv[2] // קורא את שם המשתמש שהועבר לפקודה.

// בודק שסופק שם משתמש כדי לוודא שהשליחה מיועדת לחשבון מסוים.
if (!username) {
    console.error("Usage: node scripts/sendEmailConfirmation.js <username>") // מציג את אופן ההפעלה הנדרש.
    process.exitCode = 1 // מסמן שהפקודה הסתיימה עקב שימוש לא תקין.
} else {
    // מפעיל את השליחה ומטפל בחיבור ובניתוק ממסד הנתונים.
    const run = async () => {
        try {
            // פותח חיבור למסד הנתונים שהוגדר בקובץ הסביבה.
            await mongoose.connect(process.env.DATABASE_URI)
            // מאתר את המשתמש המבוקש ומביא רק שדות שנדרשים לאימות ולשליחה.
            const user = await User.findOne({ username }).select("username roles email emailNotifications emailConfirmationSentAt")

            // עוצר אם לא נמצא חשבון עם שם המשתמש שסופק.
            if (!user) throw new Error("User not found")
            // מונע שליחה לחשבון מנהל או לתפקיד אחר.
            if (user.roles !== "User") throw new Error("The requested account is not a regular user")
            // דורש כתובת מייל קיימת והסכמה מפורשת לקבלת מיילים.
            if (!user.email || !user.emailNotifications) throw new Error("User has no email consent")
            // מונע שליחה חוזרת אם כבר נשמר זמן אישור בחשבון.
            if (user.emailConfirmationSentAt) throw new Error("Email confirmation was already sent")

            // שולח הודעת אישור לכתובת ששמורה בחשבון.
            const sent = await sendEmailConfirmation(user.email)
            // משאיר את החשבון ללא סימון אם ספק המייל לא קיבל את הבקשה.
            if (!sent) throw new Error("Email provider did not accept the confirmation")

            // שומר מתי נשלח האישור כדי למנוע משלוח חוזר.
            user.emailConfirmationSentAt = new Date()
            // מעדכן את רשומת המשתמש במסד הנתונים.
            await user.save()
            // מדווח שהמייל נשלח בלי לחשוף פרטי גישה.
            console.log(`Confirmation email sent to ${user.email}`)
        } catch (error) {
            // מציג הודעת כשל ברורה למפעיל הפקודה.
            console.error("Could not send confirmation email:", error.message)
            // מסמן שהפקודה הסתיימה ללא הצלחה.
            process.exitCode = 1
        } finally {
            // מנתק את MongoDB גם במקרה של שגיאה.
            await mongoose.disconnect()
        }
    }

    // מתחיל את הפעולה האסינכרונית של הפקודה.
    run()
}
