require("dotenv").config()
const express = require("express")
const mongoose=require("mongoose")
const cors = require("cors")
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/connectDB")
const verifyJWT = require("./middleware/verifyJWT")
const { synchronizeScheduledTodos } = require("./controllers/todosController")
const PORT = process.env.PORT || 7200
const app = express()
connectDB()

//middlewares
app.use(cors(corsOptions))
app.use(express.json())

// app.use("/api/story",require("./routes/storyRoute"))
app.use("/api/auth",require("./routes/authRoute"))
app.use(verifyJWT)

app.use("/api/incomes",require("./routes/incomesRoute"))
app.use("/api/outcomes",require("./routes/outcomesRoute"))
app.use("/api/rents",require("./routes/rentsRoute"))
app.use("/api/renters",require("./routes/rentersRoute"))
app.use("/api/amount",require("./routes/amountRoute"))
app.use("/api/todos",require("./routes/todosRoute"))
app.use("/api/users",require("./routes/userRoute"))
//routes
app.get("/", (req, res) => {
    res.send("this is the home page")
})

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    synchronizeScheduledTodos().catch((err) => console.error('Failed to sync scheduled todos', err))
    setInterval(() => {
        synchronizeScheduledTodos().catch((err) => console.error('Failed to sync scheduled todos', err))
    }, 60 * 1000)
    app.listen(PORT, () => console.log(`Server running on port
${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
})