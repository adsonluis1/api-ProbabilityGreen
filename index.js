const express = require('express')
const brasileiraoARouter = require('./routes/brasileiraoRoutes')
const premierLeagueRouter = require('./routes/premierLeague')
const ligueOneRouter = require('./routes/ligueOne')
const laLigaRouter = require('./routes/laLiga')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/brasileiraoA', brasileiraoARouter)
app.use('/premierLeague', premierLeagueRouter)
app.use('/ligueOne', ligueOneRouter)
app.use('/laLiga', laLigaRouter)

app.get('/', async (req,res)=>{
    res.json({message:'ola mundo'})
})

app.listen(3333,()=>{
    console.log('rodando')
})
