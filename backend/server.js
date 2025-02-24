const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const morgan = require('morgan')
const { dbConnect } = require('./utiles/db')

const server = http.createServer(app)
app.use(cors({
    origin : ['http://localhost:3000','http://localhost:3001'],
    credentials: true
}))

require('dotenv').config()

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
const port = process.env.PORT
dbConnect()
server.listen(port, () => console.log(`Server is running on port ${port}`))