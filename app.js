const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const personsRouter = require('./controllers/persons')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const morgan = require('morgan')

mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// --- MIDDLEWARE (Order is critical here!) ---
app.use(cors())
app.use(express.static('dist'))
app.use(express.json()) // Must be before routes to read request bodies!
app.use(middleware.requestLogger)

// Our custom token extractor - must be before routes to catch the token!
app.use(middleware.tokenExtractor) 

// --- ROUTES ---
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/persons', personsRouter)

// --- ERROR HANDLING ---
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app