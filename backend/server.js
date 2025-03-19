const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const morgan = require('morgan')
const { dbConnect } = require('./utiles/db')
const { rootRouter } = require('./routes/rootRouter')
const server = http.createServer(app)
const { Server } = require('socket.io')
const notificationSocket = require('./socket/notificationSocket')

app.use(cors({
    origin : ['http://localhost:3000','http://localhost:3001'],
    credentials: true
}))

require('dotenv').config()
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', rootRouter)

app.use('/api', require('./routes/authRoutes'))
app.use('/api/address', require('./routes/addressRoutes'))
app.use('/api', require('./routes/dashboard/sellerRouters'))
app.use('/api', require('./routes/dashboard/categoryRouters'))
app.use('/api', require('./routes/dashboard/productRouters'))
app.use('/api', require('./routes/dashboard/salaryRouters'))
app.use('/api', require('./routes/dashboard/statisticsRouters'))
app.use('/api/seller/orders', require('./routes/dashboard/orderManagerRouters'))
app.use("/api", require("./routes/chatRoutes"));
app.use('/api', require('./routes/bannerRoutes'))
app.use("/api", require("./routes/commentRoutes"));
app.use('/api', require('./routes/notifiRoutes'))

// Cấu hình socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log('Người dùng kết nối socket: ' + socket.id);
    
    // Xử lý thông báo
    notificationSocket(socket, io);
    
    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Người dùng ngắt kết nối: ' + socket.id);
    });
})
 
const port = process.env.PORT
dbConnect()
server.listen(port, () => console.log(`Server is running on port ${port}`))
