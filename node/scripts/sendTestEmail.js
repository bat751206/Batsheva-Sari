require("dotenv").config() // טוען את מפתח Resend וכתובת השולח מתוך קובץ .env המקומי.
const { sendTestEmail } = require("../services/emailNotifications") // מייבא את פונקציית שליחת הודעת הבדיקה.

const email = String(process.argv[2] || "").trim() // קורא ומנקה את כתובת היעד שהועברה לפקודה.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // מגדיר בדיקת מבנה בסיסית לכתובת מייל.

// מוודא שנמסרה כתובת תקינה לפני שליחה.
if (!emailPattern.test(email)) {
    console.error("Usage: node scripts/sendTestEmail.js <email>") // מציג את אופן ההפעלה כאשר חסרה כתובת או שהיא לא תקינה.
    process.exitCode = 1 // מסמן שהפקודה הסתיימה עקב קלט לא תקין.
} else {
    // שולח הודעת ניסיון ומחזיר קוד כשל אם Resend דחה את הבקשה.
    sendTestEmail(email).then((sent) => {
        if (!sent) { // בודק אם שירות המייל החזיר כישלון.
            process.exitCode = 1 // מסמן שהשליחה לא התקבלה על ידי Resend.
            return // עוצר כדי לא להציג הודעת הצלחה שגויה.
        }
        console.log("Resend accepted the test email request.") // מדווח שהבקשה התקבלה בלי להדפיס כתובת או סוד.
    }).catch((error) => {
        console.error("Could not send test email:", error.message) // מציג את סיבת הכשל ללא מפתח ה־API.
        process.exitCode = 1 // מסמן שהפקודה הסתיימה ללא הצלחה.
    })
}
