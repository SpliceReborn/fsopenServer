require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

var morgan = require('morgan')
const { response } = require('express')
morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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
        .then(person => {
            if (person) res.json(person)
            else res.status(404).end()
        })
        .catch(error => {
            console.log(error)
            res.status(400).send({error: 'malformatted id'})
        })
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.json(204).end()
        })
        .catch(error => console.log(error))
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
    const newPerson = new Person({
        name: req.body.name,
        number: req.body.number
    })
    newPerson.save()
        .then(savedPerson => res.json(savedPerson))
})