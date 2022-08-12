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
        minLength: [3, 'Name must have at least 3 characters']
    },
    number: {
        type: String,
        required: [true, 'Number must not be empty'],
        minLength: [8, 'Length of number must be at least 8'],
        validate: {
            validator: function(v) {
                return /\d{2,3}-\d{6,}/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
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