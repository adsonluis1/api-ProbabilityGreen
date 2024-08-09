const express = require('express')
const brasileiraoA = require('../controllers/brasileirao')
const router = express.Router()

router.get('/', brasileiraoA.getTable)
router.get('/proximosJogos', brasileiraoA.getGamesByProximosJogosCampeonato)
router.get('/:time', brasileiraoA.getTimeByName)
router.post('/addTime', brasileiraoA.addTime)
router.post('/addProximosJogos', brasileiraoA.addGamesInProximosJogos)
router.patch('/changingStatistics', brasileiraoA.changingTeamStatistics)
router.patch('/changingProximosJogos', brasileiraoA.changingTeamStatisticsProximosJogos)
router.patch('/setResultProximosJogos', brasileiraoA.setResultProximosJogos)
router.delete('/deleteProximosJogos/:hora/:data', brasileiraoA.removeGamesProximosJogosCampeonatoByTime)

module.exports = router