const Todo = require("../models/todos")
const Rents = require("../models/rents")

const getDateKey = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const addDays = (dateKey, days) => {
    const [year, month, day] = dateKey.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day + days))
    return date.toISOString().slice(0, 10)
}

const getJerusalemDateTimeKey = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jerusalem",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date())
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`
}

const synchronizeScheduledTodos = async () => {
    // קוראת את התאריך והשעה הנוכחיים לפי אזור הזמן של ירושלים.
    const nowKey = getJerusalemDateTimeKey()
    // שומרת את חלק התאריך בלבד כדי לסנן השכרות שכבר הסתיימו.
    const todayKey = nowKey.slice(0, 10)
    // טוענת מהמסד את השדות הדרושים לחישוב מועדי ההשכרה והפעלת המשימות.
    const rents = await Rents.find().select("date numOfNights todoListActivated").lean()
    // ממירה כל השכרה לאובייקט עם תאריך התחלה ותאריך סיום מחושבים.
    const rentDates = rents.map((rent) => {
        // מנרמלת את תאריך תחילת ההשכרה לפורמט YYYY-MM-DD.
        const startDate = getDateKey(rent.date)
        // ממירה את מספר הלילות למספר כדי לאפשר בדיקת תקינות וחישוב.
        const nights = Number(rent.numOfNights)
        // מחזירה את נתוני ההשכרה יחד עם מועדי התחלה וסיום.
        return {
            // משמרת את שדות ההשכרה המקוריים, כולל המזהה וסימן ההפעלה.
            ...rent,
            // שומרת את תאריך תחילת ההשכרה בפורמט אחיד.
            startDate,
            // מחשבת את תאריך הסיום רק כאשר תאריך ההתחלה ומספר הלילות תקינים.
            endDate: startDate && Number.isInteger(nights) && nights > 0
                // תאריך הסיום הוא תאריך ההתחלה בתוספת מספר הלילות.
                ? addDays(startDate, nights)
                // השכרה עם נתונים לא תקינים לא תקבל תאריך סיום.
                : null
        }
        // מסירה השכרות שאין להן תאריך התחלה או סיום תקינים.
    }).filter((rent) => rent.startDate && rent.endDate)

    // בוחרת השכרות שעדיין לא הסתיימו.
    const scheduledRents = rentDates
        // משאירה רק השכרות שמועד הסיום שלהן היום או בעתיד.
        .filter((rent) => rent.endDate >= todayKey)
        // ממיינת לפי תחילת ההשכרה כדי לעבד השכרות קרובות קודם.
        .sort((first, second) => first.startDate.localeCompare(second.startDate))
    // שומרת אם נמצאה השכרה שחלון המשימות שלה פתוח כרגע.
    let todoWindowOpen = false

    // בודקת בנפרד את מועד הפעלת המשימות עבור כל השכרה מתאימה.
    for (const rent of scheduledRents) {
        // קובעת את מועד ההפעלה הרגיל לשלושה ימים לפני תחילת ההשכרה.
        const activationDate = addDays(rent.startDate, -3)
        // מחפשת השכרה קודמת שמסתיימת בתוך חלון שלושת הימים ועד תחילת ההשכרה הזו.
        const previousRent = rentDates
            // מסננת להשכרה אחרת, שמתחילה קודם ומסתיימת בחלון הרלוונטי.
            .filter((candidate) => (
                // מוודאת שההשכרה שנבדקת אינה אותה השכרה נוכחית.
                String(candidate._id) !== String(rent._id) &&
                // מוודאת שההשכרה שנבדקת מתחילה לפני ההשכרה הנוכחית.
                candidate.startDate < rent.startDate &&
                // כוללת השכרה שמועד סיומה ביום ההפעלה הרגיל או אחריו.
                candidate.endDate >= activationDate &&
                // מוודאת שההשכרה הקודמת מסתיימת לא אחרי תחילת ההשכרה הנוכחית.
                candidate.endDate <= rent.startDate
                // סוגרת את תנאי הסינון של ההשכרות הקודמות.
            ))
            // ממיינת לפי מועד סיום כדי לבחור את ההשכרה שמסתיימת אחרונה.
            .sort((first, second) => first.endDate.localeCompare(second.endDate))
            // בוחרת את ההשכרה האחרונה לאחר המיון, או undefined אם לא נמצאה.
            .at(-1)
        // דוחה את ההפעלה ל-11:00 בצ'ק-אאוט הקודם, ואם אין כזה קובעת חצות ביום הרגיל.
        const activationKey = previousRent
            // אם נמצאה השכרה קודמת, ההפעלה תהיה ב-11:00 ביום הסיום שלה.
            ? `${previousRent.endDate}T11:00`
            // אחרת, ההפעלה תהיה בתחילת היום של שלושה ימים לפני ההשכרה.
            : `${activationDate}T00:00`
        // קובעת את סוף חלון המשימות לחצות שאחרי יום תחילת ההשכרה.
        const todoWindowEnd = `${addDays(rent.startDate, 1)}T00:00`
        // פותחת את החלון אם מועד ההפעלה הגיע ויום תחילת ההשכרה עדיין לא הסתיים.
        if (nowKey >= activationKey && nowKey < todoWindowEnd) {
            todoWindowOpen = true
        }

        // מדלגת על העדכון אם המועד לא הגיע או שההשכרה כבר הפעילה את המשימות.
        if (nowKey < activationKey || rent.todoListActivated) continue

        // מסמנת במסד את ההשכרה כמופעלת, רק אם היא עדיין לא סומנה כך.
        const activatedRent = await Rents.findOneAndUpdate(
            // מאתרת את ההשכרה לפי מזהה ודורשת שסימן ההפעלה לא יהיה true.
            { _id: rent._id, todoListActivated: { $ne: true } },
            // משנה את סימן ההפעלה כדי למנוע איפוס חוזר עבור אותה השכרה.
            { $set: { todoListActivated: true } }
        )
        // מעדכנת את המשימות רק אם ההשכרה סומנה בהצלחה ולא הופעלה במקביל.
        if (activatedRent) {
            // מאפסת את מצב המשימות להשכרה החדשה.
            await Todo.updateMany(
                {},
                { $set: { status: false, show: false } }
            )
            // מפעילה מחדש משימות קבועות בלבד.
            await Todo.updateMany(
                { isTemporary: { $ne: true } },
                { $set: { show: true } }
            )
        }
        // מסיימת את מעבר הבדיקה על כל ההשכרות שעדיין לא הסתיימו.
    }
    // מחזירה אם יש כרגע חלון פעיל להצגת המשימות.
    return todoWindowOpen
    // מסיימת את פונקציית הסנכרון.
}

const createNewTodo = async (req, res) => {
    const { title, isTemporary } = req.body
    const cleanTitle = typeof title === "string" ? title.trim() : ""
    if (!cleanTitle) {
        return res.send("title is required")
    }
    let todo = await Todo.findOne({ title: cleanTitle })
    if (todo) {
        return res.send("title must be uniqe")
    }
    const temporary = isTemporary === true
    todo = await Todo.create({
        title: cleanTitle,
        isTemporary: temporary,
        show: !temporary
    })
    res.json(todo)
}

const getAllTodos = async (req, res) => {
    const todoWindowOpen = await synchronizeScheduledTodos()
    const todos = await Todo.find()
    res.json({ todos, todoWindowOpen })
}

const getTodoById = async (req, res) => {
    const { id } = req.params
    const todo = await Todo.findById(id)
    res.json(todo)
}

const updateTodo = async (req, res) => {
    const { title } = req.body
    if (!title) {
        return res.send("title is required")
    }
    let todo = await Todo.findOne({ title })
    todo.status = !todo.status
    await todo.save()
    res.json(todo)
}

const changeDisplay = async (req, res) => {
    const { title } = req.body
    if (!title) {
        return res.send("title is required")
    }
    let todo = await Todo.findOne({ title })
    todo.show = !todo.show
    await todo.save()
    res.json(todo)
}

const deleteTodo = async (req, res) => {
    const { id } = req.params
    const todo = await Todo.findById(id)
    await todo.deleteOne()
    res.send("erased")
}



module.exports = { createNewTodo, getAllTodos, getTodoById, updateTodo, deleteTodo, changeDisplay, synchronizeScheduledTodos }