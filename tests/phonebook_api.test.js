const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Person = require('../models/person')

const api = supertest(app)

const initialPersons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
]

beforeEach(async () => {
  await Person.deleteMany({})
  let personObject = new Person(initialPersons[0])
  await personObject.save()
  personObject = new Person(initialPersons[1])
  await personObject.save()
})

test('there are two persons', async () => {
  const response = await api.get('/api/persons')
  assert.strictEqual(response.body.length, initialPersons.length)
})

test('the first person is Arto Hellas', async () => {
  const response = await api.get('/api/persons')
  const names = response.body.map(r => r.name)
  assert.ok(names.includes('Arto Hellas'))
})

test('persons are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier property of the persons is named id', async () => {
  const response = await api.get('/api/persons')
  assert.ok(response.body[0].id)
  assert.strictEqual(response.body[0]._id, undefined)
})

test('a valid person can be added', async () => {
  const newPerson = {
    name: 'Fullstack Professional',
    number: '123-456789',
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/persons')
  const names = response.body.map(r => r.name)

  assert.strictEqual(response.body.length, initialPersons.length + 1)
  assert.ok(names.includes('Fullstack Professional'))
})

test('a person can be deleted', async () => {
  const responseAtStart = await api.get('/api/persons')
  const personToDelete = responseAtStart.body[0]

  await api
    .delete(`/api/persons/${personToDelete.id}`)
    .expect(204)

  const responseAtEnd = await api.get('/api/persons')
  assert.strictEqual(responseAtEnd.body.length, initialPersons.length - 1)

  const names = responseAtEnd.body.map(r => r.name)
  assert.ok(!names.includes(personToDelete.name))
})

test('person without name is not added', async () => {
  const newPerson = {
    number: '123-456789'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  const response = await api.get('/api/persons')
  assert.strictEqual(response.body.length, initialPersons.length)
})

after(async () => {
  await mongoose.connection.close()
})