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
    })
    .catch(err => next(err))  
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
        .then(result => {
            res.json(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    // name & number cannot be empty!
    if (!req.body.name || !req.body.number) {
        const e = new Error('name and number must be filled')
        e.name = 'NameNumberEmpty'
        return next(e)
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

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    /* Don't have to check name since name must be equal 
     * to some existing name for this request to be called
     * Trying new method of throwing own custom obj (error?)
     */
    if (!body.number) throw {
        name: "NameNumberEmpty",
        message: "name and number must be filled"
    }
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, {new: true})
        .then(updatedPerson => res.json(updatedPerson))
        .catch(err => next(err))
})

const errorHandler = (err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    } else if (err.name === 'NameNumberEmpty') {
        return res.status(400).send({error: err.message})
    } else if (err.name === 'idNull') {
        return (res.status(404).send({error: err.message}))
    }
    next(err)
}

app.use(errorHandler)