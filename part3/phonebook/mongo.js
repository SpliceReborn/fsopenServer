const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 5) {
    console.log('Please add entry as follows (without the <>): node mongo.js <password> <name> <number>')
    console.log('If your name contains white space, please enclose it with quotes, i.e. "Abu Dhabi"')
    process.exit(1)
} else if (process.argv.length === 3) {
    const password = process.argv[2]

    const url = `mongodb+srv://darren:${password}@cluster0.sxcof9d.mongodb.net/phonebook?retryWrites=true&w=majority`

    mongoose
        .connect(url)
        .then(() => {
            Person.find({}).then(persons => {
                persons.forEach(person => {
                    console.log(person.name, person.number)
                })
                return mongoose.connection.close()
            })
        })
        .catch(err => console.log(err))
            
} else { // Exactly 5 arguments
    const password = process.argv[2]
    const name = process.argv[3]
    const number = process.argv[4]
    
    const url = `mongodb+srv://darren:${password}@cluster0.sxcof9d.mongodb.net/phonebook?retryWrites=true&w=majority`
    
    mongoose
        .connect(url)
        .then(() => {
            const person = new Person({
                name: name,
                number: number,
            })
            return person.save()
        })
        .then(() => {
            console.log(`added ${name} to phonebook with number: ${number}`)
            return mongoose.connection.close()
        })
        .catch(err => console.log(err))
}

