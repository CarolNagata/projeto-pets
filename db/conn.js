const mongoose = require('mongoose')

async function main() {
    await mongoose.connect('mongodb://0.0.0.0:27017/test')
    //await mongoose.connect('mongodb+srv://carolinenagata:xuRtOVqKoJeRgPuH@cluster0.bpamlmv.mongodb.net/?retryWrites=true&w=majority')
    console.log('conectado ao banco')
}

main().catch((err) => console.log(err))

module.exports = mongoose

//xuRtOVqKoJeRgPuH => password mongodb  user: carolinenagata
//mongodb+srv://carolinenagata:<password>@cluster0.bpamlmv.mongodb.net/


