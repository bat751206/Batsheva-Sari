const User = require("../models/users") // מייבא את מודל המשתמשים כדי לאתר נמענים שאישרו קבלת מייל.

// ממיר טקסט לערך בטוח להצגה בתוך הודעת HTML.
const escapeHtml = (value) => String(value) // מבטיח שהערך יטופל כמחרוזת.
    .replaceAll("&", "&amp;") // ממיר סימן אמפרסנד כדי שלא יתפרש כישות HTML.
    .replaceAll("<", "&lt;") // מונע מטקסט להפוך לתג HTML.
    .replaceAll(">", "&gt;") // מונע מטקסט לסגור או לפתוח תג HTML.
    .replaceAll('"', "&quot;") // מונע ממרכאות לשבור מאפייני HTML.
    .replaceAll("'", "&#39;") // ממיר גרש כדי למנוע הזרקת HTML.

// בונה קישור מלא לנתיב באפליקציה.
const getAppUrl = (path) => { // מקבלת נתיב יחסי של העמוד הרלוונטי.
    const baseUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, "") // קוראת כתובת בסיס מההגדרות ומסירה לוכסנים בסופה.
    return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` // מצרפת את הנתיב תוך שמירה על לוכסן מפריד יחיד.
} // מסיימת את בניית הקישור.

// שולח מייל לכתובת אחת ומחזיר אם ספק המייל קיבל את הבקשה.
const sendEmailToAddress = async ({ email, subject, message, path = "/todos" }) => { // מקבל נמען, תוכן ונתיב לקישור.
    const apiKey = process.env.RESEND_API_KEY // קורא את מפתח הגישה ל־Resend ממשתני הסביבה.
    const from = process.env.MAIL_FROM // קורא את כתובת השולח שאומתה ב־Resend.
    if (!apiKey || !from) { // בודק שמפתח API וכתובת שולח הוגדרו.
        console.warn("Email notification skipped: configure RESEND_API_KEY and MAIL_FROM") // מתעד שחסרות הגדרות לשליחה.
        return false // מדווח שהמייל לא נשלח.
    } // מסיים את בדיקת ההגדרות.

    try { // תופס שגיאות רשת כדי שלא יפילו את פעולת המערכת.
        const link = getAppUrl(path) // בונה קישור מלא ליעד במערכת.
        const safeMessage = escapeHtml(message).replaceAll("\n", "<br>") // מגן על תוכן ההודעה ושומר ירידות שורה.
        const html = `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#1d312c"><h2>${escapeHtml(subject)}</h2><p>${safeMessage}</p><p><a href="${escapeHtml(link)}">פתיחת המערכת</a></p></div>` // יוצר גוף מייל בעברית עם קישור.
        const response = await fetch("https://api.resend.com/emails", { // שולח בקשת מייל לשירות Resend.
            method: "POST", // מגדיר יצירת הודעה חדשה.
            headers: { // מגדיר הרשאה וסוג תוכן לבקשה.
                Authorization: `Bearer ${apiKey}`, // מעביר את מפתח ה־API בכותרת ההרשאה.
                "Content-Type": "application/json" // מציין שגוף הבקשה הוא JSON.
            }, // מסיים הגדרת כותרות.
            signal: AbortSignal.timeout(10000), // מבטל בקשה שלא הסתיימה בתוך עשר שניות.
            body: JSON.stringify({ from, to: [email], subject, html, text: `${subject}\n\n${message}\n\n${link}` }) // מעביר את השולח, הנמען ותוכן המייל לספק.
        }) // מסיים את בקשת השליחה.
        if (!response.ok) { // בודק אם Resend דחה את בקשת השליחה.
            const responseBody = await response.text() // קורא את פרטי השגיאה ש־Resend החזיר בלי לקרוא או להדפיס את מפתח ה־API.
            let providerMessage = responseBody // משתמש בגוף התשובה כטקסט אם הוא אינו JSON תקין.
            try { // מנסה לחלץ הודעת שגיאה קריאה מתשובת JSON.
                providerMessage = JSON.parse(responseBody).message || responseBody // מציג את הודעת Resend אם קיימת.
            } catch { // משאיר את גוף התשובה המקורי אם הוא אינו JSON.
                providerMessage = responseBody // שומר את הטקסט המקורי לצורך אבחון.
            } // מסיים פענוח הודעת הספק.
            console.error(`Email delivery failed for ${subject}: HTTP ${response.status}: ${providerMessage}`) // מתעד סטטוס והסבר בלי לחשוף פרטי הרשאה.
        } // מסיים טיפול בתשובת שגיאה.
        return response.ok // מחזיר אם Resend קיבל את בקשת השליחה.
    } catch (error) { // מטפל בכשלי רשת או ספק.
        console.error("Resend email notification failed:", error.message) // שומר את פרטי כשל Resend ביומן השרת.
        return false // מדווח שהשליחה נכשלה.
    } // מסיים את טיפול השגיאות.
} // מסיים שליחה לנמען יחיד.

// שולח מייל לכל המשתמשים בעלי התפקידים וההסכמה המתאימים.
const deliverEmail = async ({ roles, subject, message, path = "/todos" }) => { // מקבל קהל יעד, כותרת, תוכן ונתיב ברירת מחדל למשימות.
    const apiKey = process.env.RESEND_API_KEY // בודק שמפתח Resend זמין.
    const from = process.env.MAIL_FROM // בודק שכתובת שולח זמינה.
    if (!apiKey || !from) { // מונע ניסיון שליחה כשחסרות הגדרות בסיסיות.
        console.warn("Email notification skipped: configure RESEND_API_KEY and MAIL_FROM") // מתעד ביומן כיצד להשלים את הגדרות השליחה.
        return false // מודיע שהשליחה דולגה.
    } // מסיים את בדיקת ההגדרות.

    try { // תופס שגיאות מסד או ספק כדי שלא יבטלו את פעולת המערכת.
        const recipients = await User.find({ // מאתר משתמשים שמתאימים לכל תנאי קבלת המייל.
            roles: { $in: roles }, // מגביל את התוצאות לתפקידים שנדרשו לאירוע.
            emailNotifications: true, // כולל רק מי שאישר קבלת הודעות.
            email: { $type: "string", $ne: "" } // דורש כתובת מייל קיימת ולא ריקה.
        }).select("email").lean() // מחזיר רק כתובות בפורמט פשוט וקל.
        const emails = [...new Set(recipients.map(({ email }) => email.trim().toLowerCase()).filter(Boolean))] // מנקה כתובות ומסיר כפילויות.
        if (!emails.length) return true // מסיים בהצלחה כשאין נמענים מתאימים.

        // שולח הודעה נפרדת לכל כתובת כדי להסתיר כתובות של נמענים אחרים.
        const results = await Promise.all(emails.map((email) => sendEmailToAddress({ email, subject, message, path })))
        if (results.some((success) => !success)) { // בודק אם לפחות שליחה אחת נכשלה.
            console.error(`Email delivery failed for ${subject}`) // מתעד כישלון של ספק המייל ביומן השרת.
            return false // מסמן שהשליחה לא הושלמה לכל הנמענים.
        } // מסיים את בדיקת תוצאות השליחה.
        return true // מסמן שכל בקשות השליחה הצליחו.
    } catch (error) { // מטפל בכשלי רשת, ספק או מסד נתונים.
        console.error("Email notification failed:", error.message) // שומר ביומן את הודעת השגיאה לצורך אבחון.
        return false // מאפשר לפעולת המערכת להמשיך למרות כשל ההתראה.
    } // מסיים את טיפול השגיאות.
} // מסיים את פונקציית שליחת המייל.

// שולח למשתמשים ולמנהלים שאישרו מייל הודעה על משימות פתוחות.
const notifyUsersOfPendingTodos = (titles) => { // מקבל את שמות המשימות שעדיין ממתינות לביצוע.
    const taskList = titles.map((title) => `• ${title}`).join("\n") // יוצר רשימת משימות קריאה בגוף ההודעה.
    return deliverEmail({ // מפעיל את שירות המייל עם הקהל והתוכן המתאימים.
        roles: ["User", "Admin"], // שולח למשתמשים רגילים ולמנהלים.
        subject: "יש משימות לביצוע", // קובע את כותרת ההודעה בעברית.
        message: `המשימות הפתוחות במערכת:\n${taskList}` // מצרף את שמות המשימות הפתוחות.
    }) // מסיים את העברת פרטי ההתראה לשירות.
} // מסיים את פונקציית התראת המשימות.

// שולח התראות אירוע למנהלים שאישרו קבלת מייל.
const notifyAdmins = ({ subject, message, path }) => deliverEmail({ // מקבל את תוכן ההתראה ואת נתיב היעד.
    roles: ["Admin"], // מגביל את הנמענים למנהלים.
    subject, // מעביר את כותרת ההתראה לשירות השליחה.
    message, // מעביר את תוכן ההתראה לשירות השליחה.
    path // מעביר את הנתיב שיופיע כקישור בהודעה.
}) // מסיים את בקשת שליחת ההתראה למנהלים.

// שולח אישור חד־פעמי למשתמש שאישר לקבל הודעות.
const sendEmailConfirmation = (email) => sendEmailToAddress({ // מקבל כתובת משתמש יחידה.
    email, // שולח את האישור לכתובת שהמשתמש הזין.
    subject: "אישור קבלת מיילים מהמערכת", // מציג לנמען את מטרת ההודעה.
    message: "כתובת המייל שלך נרשמה לקבלת התראות מהמערכת. הודעה זו נשלחת פעם אחת כאישור.", // מאשר שהכתובת נרשמה להתראות.
    path: "/todos" // מצרף קישור לדף המשימות במערכת.
}) // מסיים את יצירת הודעת האישור.

module.exports = { notifyUsersOfPendingTodos, notifyAdmins, sendEmailConfirmation } // חושף את שלושת שירותי המייל לבקרים ולכלי החד־פעמי.
