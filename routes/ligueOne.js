const express = require('express')
const router = express.Router()
const controllers = require('../controllers/controllers')

router.get('/', controllers.getTable)
router.get('/proximosJogos', controllers.getGamesByProximosJogosCampeonato)
router.get('/:time', controllers.getTimeByName)
router.post('/addTime', controllers.addTime)
router.post('/addProximosJogos', controllers.addGamesInProximosJogos)
router.patch('/changingStatistics', controllers.changingTeamStatistics)
router.patch('/changingPosition', controllers.changingPositionTable)
router.patch('/changingProximosJogos', controllers.changingTeamStatisticsProximosJogos)
router.patch('/setResultProximosJogos', controllers.setResultProximosJogos)
router.delete('/deleteProximosJogos/:hora/:data', controllers.removeGamesProximosJogosCampeonatoByTime)

module.exports = router