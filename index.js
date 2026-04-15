const express = require('express')
const morgan = require('morgan')
const cors = require('cors') 
const app = express()

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

let persons = [
    { "id": "1", "name": "Arto Hellas", "number": "040-123456" },
    { "id": "2", "name": "Ada Lovelace", "number": "39-44-5323523" },
    { "id": "3", "name": "Dan Abramov", "number": "12-43-234345" },
    { "id": "4", "name": "Mary Poppendieck", "number": "39-23-6423122" }
]


// Comment this out so Express shows the 'dist' folder instead!
// app.get('/', (request, response) => {
//   response.send('<h1>Hello Phonebook!</h1>')
// })

app.get('/info', (request, response) => {
  const count = persons.length
  const date = new Date()
  response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }
  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  const person = {
    id: String(Math.floor(Math.random() * 1000000)),
    name: body.name,
    number: body.number,
  }
  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})