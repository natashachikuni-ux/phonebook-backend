const jwt = require('jsonwebtoken')
const User = require('../models/user')
const personsRouter = require('express').Router()
const Person = require('../models/person')

// Get all persons
personsRouter.get('/', async (request, response) => {
  const persons = await Person.find({}).populate('user', { username: 1, name: 1 })
  response.json(persons)
})

// Get a single person by ID
personsRouter.get('/:id', async (request, response) => {
  const person = await Person.findById(request.params.id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// Delete a person
personsRouter.delete('/:id', async (request, response) => {
  await Person.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// Add a new person
personsRouter.post('/', async (request, response) => {
  const body = request.body

  // --- NEW SAFETY CHECK STARTS HERE ---
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }
  // --- NEW SAFETY CHECK ENDS HERE ---

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const person = new Person({
    name: body.name,
    number: body.number,
    user: user.id
  })

  const savedPerson = await person.save()
  user.persons = user.persons.concat(savedPerson._id)
  await user.save()

  response.status(201).json(savedPerson)
})

module.exports = personsRouter