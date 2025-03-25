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
const chatSocket = require('./socket/chatSocket')
const { swaggerSpec, swaggerUi } = require('./utiles/swagger')

app.use(cors({
    origin : ['http://localhost:3000','http://localhost:3001'],
    credentials: true
}))

require('dotenv').config()
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/api', rootRouter)
app.use('/api', require('./routes/authRoutes'))
app.use('/api/address', require('./routes/addressRoutes'))
app.use('/api', require('./routes/dashboard/sellerRouters'))
app.use('/api', require('./routes/dashboard/categoryRouters'))
app.use('/api', require('./routes/dashboard/productRouters'))
app.use('/api', require('./routes/dashboard/salaryRouters'))
app.use('/api/statistics', require('./routes/dashboard/statisticsRouters'))
app.use('/api/admin', require('./routes/dashboard/adminRouters'))
app.use('/api/seller/orders', require('./routes/dashboard/orderManagerRouters'))
app.use('/api/dashboard/cash-flow', require('./routes/dashboard/cashFlowRoutes'))
app.use("/api", require("./routes/chatRoutes"));
app.use('/api', require('./routes/bannerRoutes'))
app.use("/api", require("./routes/commentRoutes"));
app.use('/api', require('./routes/notifiRoutes'))

// Cấu hình socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    },
    // Cấu hình kết nối lại
    pingTimeout: 60000,
    pingInterval: 25000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
})

io.on('connection', (socket) => {
    console.log('Người dùng kết nối socket: ' + socket.id);
    
    // Xử lý thông báo
    notificationSocket(socket, io);
    
    // Xử lý chat
    chatSocket(socket, io);
    
    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Người dùng ngắt kết nối: ' + socket.id);
    });
})
 
const port = process.env.PORT
dbConnect()
server.listen(port, () => console.log(`Server is running on port ${port}`))
