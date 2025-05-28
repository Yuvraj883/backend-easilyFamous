import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
const app = express()
import userRoute from './src/routes/User.js'
import User from './src/models/User.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import orderRoutes from './src/routes/proxy.js'
import axios from 'axios'
import apiV2ProxyRoute from './src/routes/apiV2Proxy.js'
import helmet from 'helmet'
import winston from 'winston'

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
app.use((req, res, next) => {
  console.log('🔍 Origin Header:', req.headers.origin)
  next()
})

app.use(express.json())
app.use(helmet())
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || []
console.log('AllowedOrigin:', allowedOrigins)
const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin)
    console.log(allowedOrigins)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

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

export default app
