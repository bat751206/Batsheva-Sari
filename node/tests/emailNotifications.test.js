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
    sendEmailConfirmation,
    // שולחת הודעת בדיקה לכתובת שאינה חייבת להיות רשומה במערכת.
    sendTestEmail,
    // שולחת התראת תשלום לכתובת קבועה שהוגדרה בסביבה.
    sendPaymentNotification
} = require("../services/emailNotifications")

// בודק קהל יעד, הסרת כתובות כפולות, קישורים ותוכן הודעות.
test("Resend notifications use opted-in recipients, deduplicate addresses, and include links", async (context) => {
    // שומר פעולות מקוריות כדי להחזיר אותן אחרי הבדיקה.
    const originalFind = User.find
    // שומר משתני סביבה לפני שינוי זמני לצורכי הבדיקה.
    const originalEnvironment = {
        RESEND_API_KEY: process.env.RESEND_API_KEY, // שומר את מפתח Resend המקורי.
        MAIL_FROM: process.env.MAIL_FROM, // שומר את כתובת השולח המקורית.
        PAYMENT_NOTIFICATION_EMAIL: process.env.PAYMENT_NOTIFICATION_EMAIL, // שומר את כתובת ההתראה המקורית.
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

    // בודק שמייל ניסיון נשלח לכתובת שסופקה בלי חיפוש משתמש במסד.
    sentMessages.length = 0
    assert.equal(await sendTestEmail("resend-account@example.com"), true) // מוודא שהשירות קיבל את בקשת הניסיון.
    assert.equal(sentMessages.length, 1) // מוודא שנוצרה הודעת ניסיון אחת.
    assert.deepEqual(sentMessages[0].to, ["resend-account@example.com"]) // מוודא שהכתובת מהפקודה היא הנמען.
    assert.equal(sentMessages[0].subject, "בדיקת שליחת מייל מהמערכת") // בודק את נושא הודעת הבדיקה.
    assert.equal(sentMessages[0].text, "נוצר ע\"י הדרכת github copilot") // מוודא שגוף הטקסט מכיל רק את המשפט שהתבקש.
    assert.doesNotMatch(sentMessages[0].html, /<h2>|פתיחת המערכת/) // מוודא שלא נוספו כותרת או קישור לגוף הבדיקה.

    // בודק שעדכון תשלום שולח הודעה עם פרטי השוכר, התאריך ושם המנהל.
    process.env.PAYMENT_NOTIFICATION_EMAIL = "resend-account@example.com"
    sentMessages.length = 0
    const paymentDate = new Date("2026-03-09T10:00:00Z") // מגדיר תאריך קבוע כדי לבדוק המרה לשעון ישראל.
    assert.equal(await sendPaymentNotification({ renterName: "רות כהן", paymentDate, managerName: "admin-user" }), true) // מוודא ששליחת התראת התשלום הצליחה.
    assert.deepEqual(sentMessages[0].to, ["resend-account@example.com"]) // מוודא שהנמען מגיע מהגדרת הסביבה.
    const paymentDateText = new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric" }).format(paymentDate) // מחשב את התאריך הצפוי לפי שעון ישראל.
    assert.equal(sentMessages[0].text, `ההשכרה של רות כהן שולמה בתאריך ${paymentDateText} עודכן באמצעות: admin-user`) // מוודא שכל הפרטים מופיעים בנוסח המבוקש.
    assert.match(sentMessages[0].subject, /^עדכון תשלום במערכת \| /) // מוודא שהנושא מזהה התראת תשלום.
    const firstPaymentSubject = sentMessages[0].subject // שומר את הנושא הראשון להשוואת עדכונים.
    await sendPaymentNotification({ renterName: "רות כהן", paymentDate, managerName: "admin-user" }) // שולח עדכון נוסף עם אותם פרטי תשלום.
    assert.notEqual(sentMessages[1].subject, firstPaymentSubject) // מוודא שכל עדכון מקבל נושא חדש ושרשור נפרד.
})
