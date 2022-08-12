require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

var morgan = require('morgan')
morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.get('/info', (req, res, next) => {
    Person.find({}).then(persons => {
        res.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}
        `)
    }).catch(err => next(err))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => res.json(persons))
        .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) res.json(person)
            else {
                const e = new Error('Id not found')
                e.name = 'idNull'
                next(e)
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.json(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body
    Person.findOne({ name: name })
        .then(person => {
            if (person) throw {
                name: 'InvalidPOST',
                message: 'POST request to existing name, should be PUT'
            }
            else {
                const newPerson = new Person({
                    name: name,
                    number: number
                })
                newPerson.save()
                    .then(savedPerson => res.json(savedPerson))
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body
    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => res.json(updatedPerson))
        .catch(err => next(err))
})

const errorHandler = (err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }
    else if (err.name === 'NameNumberEmpty' || err.name === 'idNull'
        || err.name === 'ValidationError' || err.name === 'InvalidPOST'
    ) { return res.status(400).send({ error: err.message }) }
    next(err)
}

app.use(errorHandler)