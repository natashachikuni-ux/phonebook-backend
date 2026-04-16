require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist')) // This tells Express to look for your React app here

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// REMOVE OR COMMENT OUT THE app.get('/') BLOCK ENTIRELY
/*
app.get('/', (request, response) => {
  response.send('<h1>Hello Phonebook!</h1>')
})
*/

// Comment this out so Express shows the 'dist' folder instead!
// app.get('/', (request, response) => {
//   response.send('<h1>Hello Phonebook!</h1>')
// })

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) // This sends the error to your new errorHandler
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => { // Added () here
      response.status(204).end()
    })
    .catch(error => next(error))
})
// ... existing app.post code above ...
app.post('/api/persons', (request, response, next) => { // Added 'next' here
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error)) // This is the fix!
})

// PASTE THE PUT ROUTE HERE:
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // runValidators: true is needed to check the rules during an update
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// --- ADD THE ERROR HANDLER HERE ---

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    // This catches the new validation rules we just added!
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})