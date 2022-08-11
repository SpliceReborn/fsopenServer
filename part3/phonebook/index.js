require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

var morgan = require('morgan')
morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.get('/info', (req, res) => {
    res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}
    `)
})

app.get('/api/persons', (req, res) => {
    Person.find({})
        .then(persons => res.json(persons))
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then(person => res.json(person))
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.json(204).end()
})

app.post('/api/persons', (req, res) => {
    // name & number cannot be empty!
    if (!req.body.name || !req.body.number) {
        return res.status(400).json({
            error: 'name and number must be filled'
        })
    }
    /* 3.14: Temporary allow adding repeated names
     * const nameExists = persons.filter(p => 
     *    p.name.toLowerCase() === req.body.name.toLowerCase()
     * ) 
     *  
     * if (!!nameExists.length) {
     *    return res.status(400).json({
     *        error: 'name already exists'
     *    })
     * }
     */  
    const newPerson = {
        name: req.body.name,
        number: req.body.number
    }
    newPerson.save()
        .then(savedPerson => res.json(savedPerson))
})