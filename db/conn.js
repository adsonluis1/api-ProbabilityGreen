const {MongoClient} = require('mongodb')
require('dotenv').config()
const {URI_DB} = process.env

const client = new MongoClient(URI_DB)

const run = async ()=>{
    try {
        await client.connect()
        console.log("db conectado")
    } catch (error) {
        console.log(`Error ao conectar com o mongodb - ${error}` )
    }
}

run()

module.exports = client