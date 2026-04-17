const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// GET all users
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('persons', { name: 1, number: 1 }) // This pulls in the details!

  response.json(users)
})
// POST a new user
usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  // Password validation
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'password must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error) // This sends the error to your middleware (like 'unique' validation)
  }
})

module.exports = usersRouter