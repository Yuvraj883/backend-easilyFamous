require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const userRoute = require('./src/routes/User')
const User = require('./src/models/User')
const bodyParser = require('body-parser')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const orderRoutes = require('./src/routes/proxy')
const axios = require('axios')
const apiV2ProxyRoute = require('./src/routes/apiV2Proxy')
const helmet = require('helmet')
const winston = require('winston')

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Add more transports like file logging in production
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
})

app.use(bodyParser.json())
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.set('trust proxy', 1)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected')
    logger.info('DB connected')
  })
  .catch((e) => {
    console.error('Mongoose error: ', e)
    logger.error('Mongoose error: ', e)
    // In a real production app, you might want to exit or take other actions on DB connection failure
  })

const PORT = process.env.PORT || 8000
app.use(express.json())

// Log requests (optional, but helpful)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

app.use('/user', userRoute)
app.get('/', async (req, res) => {
  // const user = await User.create({
  //   fullName:"Yuvraj Singh",
  //   email:"devyuvraj883@gmail.com",
  //   password:"Yuvraj123"
  // });
  res.send('Welcome')
})

// Rate Limiter (1 request per 6 hours)
const limiter = rateLimit({
  windowMs: 6 * 60 * 60 * 1000, // 6 hours
  max: 1,
  message: 'You have already claimed within the last 6 hours.',
})

app.use('/api', limiter)
app.use('/api/orders', orderRoutes)
app.use('/getInstaLikes', apiV2ProxyRoute)

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Caught unhandled error:', err)
  logger.error('Caught unhandled error:', err)
  // Send back error details in development for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    res.status(err.status || 500).send(err.message || 'Something broke!')
  } else {
    res.status(500).send('Something broke!')
  }
})

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
  logger.info(`Server started at port ${PORT}`)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  logger.error('Uncaught Exception:', err)
  // In production, a process manager like PM2 would handle restarts
  // process.exit(1) // Consider graceful shutdown/restart
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // In production, a process manager like PM2 would handle restarts
  // process.exit(1) // Consider graceful shutdown/restart
})

module.exports = app
