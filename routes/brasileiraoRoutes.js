const express = require('express')
const brasileiraoA = require('../controllers/brasileirao')
const router = express.Router()

router.get('/', brasileiraoA.getTable)
router.get('/proximosJogos', brasileiraoA.getGamesByProximosJogosCampeonato)
router.get(/[a-z]+/i, brasileiraoA.getTimeByName)
router.post('/addTime', brasileiraoA.addTime)
router.post('/addProximosJogos', brasileiraoA.addGamesInProximosJogos)
router.patch('/changingStatistics', brasileiraoA.changingTeamStatistics)
router.patch('/changingProximosJogos', brasileiraoA.changingTeamStatisticsProximosJogos)
router.patch('/patchTable', brasileiraoA.patchTable)
router.delete('/deleteProximosJogos', brasileiraoA.removeGamesProximosJogosCampeonatoByTime)

module.exports = router