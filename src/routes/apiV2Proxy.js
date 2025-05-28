import express from 'express'
const router = express.Router()
import axios from 'axios'
import rateLimit from 'express-rate-limit'
import { body, query, validationResult } from 'express-validator' // Import express-validator
import winston from 'winston' // Import winston

// Assuming you have a logger instance in app.js, you can either pass it
// or create a new one here. For simplicity, let's create one for this file.
// In a larger app, consider a shared logging module.
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Add more transports like file logging in production
  ],
})

const key = process.env.API_KEY // Use environment variable
const baseURL = process.env.BASE_URL // Use environment variable

// New Rate Limiter for /api/v2
const apiV2Limiter = rateLimit({
  windowMs: 6 * 60 * 60 * 1000, // 6 hours
  max: 1, // Allow only 1 request per 6-hour window per IP
  message: 'You have already claimed within the last 6 hours.',
})

// Validation for POST /api/v2
const postValidation = [
  body('link').isURL().withMessage('Invalid link provided'),
]

// Proxy POST requests to /api/v2
router.post('/', apiV2Limiter, postValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in /api/v2 POST:', errors.array())
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const action = 'add'
    const service = 3055
    const quantity = 10
    const { link } = req.body

    const response = await axios.post(
      baseURL,
      { key, action, service, link, quantity },
      { headers: { 'Content-Type': 'application/json' } }
    )

    logger.info('Successful POST to external API /api/v2', { link })
    res.json(response.data)
  } catch (error) {
    logger.error('Error in /api/v2 POST:', error)
    console.error('Error in /api/v2 POST:', error.message)
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: 'Internal Server Error' })
  }
})

// Validation for GET /api/v2
const getValidation = [
  query('action').notEmpty().withMessage('Action cannot be empty'),
  // Add more specific validation for action if needed
]

// Proxy GET requests to /api/v2
router.get('/', apiV2Limiter, getValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in /api/v2 GET:', errors.array())
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { key: apiKeyQuery, action } = req.query // Use a different variable name to avoid conflict
    // Note: We are using the API_KEY from environment variables, not the one from the query string for security.

    const response = await axios.get(`${baseURL}?key=${key}&action=${action}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    logger.info('Successful GET to external API /api/v2', { action })
    res.json(response.data)
  } catch (error) {
    logger.error('Error in /api/v2 GET:', error)
    console.error('Error in /api/v2 GET:', error.message)
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: 'Internal Server Error' })
  }
})

export default router
