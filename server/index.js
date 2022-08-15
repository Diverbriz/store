require('dotenv').config()
// Модели(User)
const models = require('./models/models')
// Подключаемые модули
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')
const express = require('express')
const sequelize = require('./db')
const router = require('./routes/index')
// Порт сервера
const PORT = process.env.PORT
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const cors = require('cors')
const {BasketDevice} = require("./models/models");
// Используемые модули
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)
app.use(cookieParser(process.env.SECRET_KEY))
//Обязательно в самом конце, обработка ошибок
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
