const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017/probabilityGreen"

const client = new MongoClient(uri)

const run = async ()=>{
    try {
        client.connect()
        console.log("db conectado")
    } catch (error) {
        console.log(`Error ao conectar com o mongodb - ${error}` )
    }
}

run()

module.exports = client