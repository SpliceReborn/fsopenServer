const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('connecting to database')

mongoose.connect(url)
    .then(result => {
        console.log('connnected to MongoDB')
    })
    .catch(error => console.log(error.message))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name must not be empty'],
        minLength: [3, 'Length of name must be at least 3 characters']
    },
    number: {
        type: String,
        required: [true, 'Number must not be empty'],
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)