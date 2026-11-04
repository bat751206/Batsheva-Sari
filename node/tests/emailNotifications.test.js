const assert = require("node:assert/strict") // מייבא בדיקות השוואה קשיחות לבדיקת התוצאות.
const { test } = require("node:test") // מייבא את מסגרת הבדיקות המובנית של Node.js.
const User = require("../models/users") // מייבא את מודל המשתמש כדי לדמות חיפוש נמענים.
const originalFetch = global.fetch // שומר את fetch המקורי כדי להחזירו לאחר הבדיקה.
// מייבא את פונקציות המייל שנבדקות.
const {
    // שולחת התראות משימות למשתמשים ולמנהלים שאישרו.
    notifyUsersOfPendingTodos,
    // שולחת התראות ניהול למנהלים בלבד.
    notifyAdmins,
    // שולחת הודעת אישור חד־פעמית לכתובת נתונה.
    sendEmailConfirmation
} = require("../services/emailNotifications")

// בודק קהל יעד, הסרת כתובות כפולות, קישורים ותוכן הודעות.
test("Resend notifications use opted-in recipients, deduplicate addresses, and include links", async (context) => {
    // שומר פעולות מקוריות כדי להחזיר אותן אחרי הבדיקה.
    const originalFind = User.find
    // שומר משתני סביבה לפני שינוי זמני לצורכי הבדיקה.
    const originalEnvironment = {
        RESEND_API_KEY: process.env.RESEND_API_KEY, // שומר את מפתח Resend המקורי.
        MAIL_FROM: process.env.MAIL_FROM, // שומר את כתובת השולח המקורית.
        APP_URL: process.env.APP_URL // שומר את כתובת האפליקציה המקורית.
    }
    // אוסף את תנאי החיפוש ואת בקשות השליחה המדומות.
    const queries = [] // אוסף את תנאי החיפוש שבהם השירות פנה למודל המשתמשים.
    const sentMessages = [] // אוסף הודעות מדומות במקום לשלוח אותן בפועל.

    // מגדיר מפתח Resend מדומה כדי לא לשלוח בקשות אמיתיות.
    process.env.RESEND_API_KEY = "test-key"
    process.env.MAIL_FROM = "House <verified@example.com>" // מגדיר כתובת שולח מדומה.
    process.env.APP_URL = "https://app.example.com" // מגדיר כתובת אתר מדומה לבדיקת הקישורים.

    // מחליף את חיפוש המשתמשים בנתונים קבועים לבדיקת הנמענים.
    User.find = (query) => {
        queries.push(query) // שומר את תנאי החיפוש לבדיקת התפקיד וההסכמה.
        return {
            select() { return this }, // מאפשר שרשור select כמו בשאילתת Mongoose.
            async lean() {
                return [
                    { email: "user@example.com" },
                    { email: "user@example.com" },
                    { email: "admin@example.com" }
                ]
            } // מסיים את החזרת משתמשי הבדיקה.
        }
    }

    // מדמה את fetch של Resend ושומר את בקשות המייל לבדיקה.
    global.fetch = async (url, options) => {
        assert.equal(url, "https://api.resend.com/emails")
        assert.equal(options.headers.Authorization, "Bearer test-key")
        sentMessages.push(JSON.parse(options.body)) // שומר את פרטי המייל במקום לשלוח אותו בפועל.
        return { ok: true, status: 200 } // מחזיר תשובת הצלחה מדומה מהספק.
    }

    // משחזר את המימושים ואת משתני הסביבה גם אם הבדיקה נכשלת.
    context.after(() => {
        User.find = originalFind // מחזיר את חיפוש המשתמשים למימוש המקורי.
        global.fetch = originalFetch // מחזיר את fetch המקורי של Node.js.
        for (const [key, value] of Object.entries(originalEnvironment)) {
            if (value === undefined) delete process.env[key] // מסיר משתנה שלא היה מוגדר לפני הבדיקה.
            else process.env[key] = value // משחזר את הערך המקורי של משתנה שהיה מוגדר.
        }
    })

    // בודק התראת משימות, נמען ייחודי, קישור, נושא והסכמה לקבלת מייל.
    await notifyUsersOfPendingTodos(["משימת בדיקה"])
    assert.equal(sentMessages.length, 2) // מוודא שהכתובת הכפולה נשלחה פעם אחת בלבד.
    assert.equal(sentMessages[0].from, "House <verified@example.com>") // בודק את כתובת השולח שנשלחה ל־Resend.
    assert.equal(sentMessages[0].subject, "יש משימות לביצוע") // בודק את נושא מייל המשימות.
    assert.match(sentMessages[0].html, /https:\/\/app\.example\.com\/todos/) // מוודא שקיים קישור לדף המשימות.
    assert.match(sentMessages[0].text, /משימת בדיקה/) // מוודא שגוף הטקסט כולל את שם המשימה.
    assert.deepEqual(queries[0].roles.$in, ["User", "Admin"]) // מוודא שמשתמשים ומנהלים כלולים בקהל.
    assert.equal(queries[0].emailNotifications, true) // מוודא שרק בעלי הסכמה נכללים.

    // בודק שהתראת מנהל נשלחת למנהלים בלבד וכוללת את הנתיב המבוקש.
    sentMessages.length = 0
    await notifyAdmins({ subject: "בדיקת מנהל", message: "בדיקת הודעה", path: "/amount" })
    assert.equal(sentMessages.length, 2) // מוודא שהודעה נשלחה לכל כתובת ייחודית.
    assert.deepEqual(queries[1].roles.$in, ["Admin"]) // מוודא שקהל היעד מוגבל למנהלים.
    assert.match(sentMessages[0].html, /https:\/\/app\.example\.com\/amount/) // בודק שהקישור מפנה לנתיב המלאי.

    // בודק שאישור חד־פעמי יוצר הודעה אחת עם הנושא המתאים.
    sentMessages.length = 0
    assert.equal(await sendEmailConfirmation("user@example.com"), true)
    assert.equal(sentMessages.length, 1) // מוודא שנשלחה בקשת אישור יחידה.
    assert.equal(sentMessages[0].subject, "אישור קבלת מיילים מהמערכת") // בודק את נושא הודעת האישור.
})
