const BrasileiraoModels = require('../models/brasileiraoModels')

function transformingHoursInNumbers(hours){
    return Number(hours.replace(':',''))
}

function transformingNumbersInHours(number){
    return number.splice(2,0,":")
}

function makeArrayJogosAnteriores (jogosAnteriores, jogoAnterior){
    if(jogosAnteriores.length == 3){
        jogosAnteriores.splice(2, 1)
        jogosAnteriores.splice(0, 0, jogoAnterior)
    }
    else if(jogosAnteriores.length < 3)
        jogosAnteriores.splice(0, 0, jogoAnterior)
    return jogosAnteriores
}

function makeArrayProximosJogos (proximosJogos, adversario){
    if(proximosJogos.length == 3){
        proximosJogos.splice(2, 1)
        proximosJogos.splice(0, 0, adversario)
    }
    else if(proximosJogos.length < 3)
        proximosJogos.splice(0, 0, adversario)
    return proximosJogos
}

module.exports = class brasileiraoA {
    static async addTime(req, res){
        const {nome,rank,vitorias,derrotas,empates,golsMarcados,golsSofridos,saldoGols,jogosAnteriores,proximosJogos,pontos,posicao,id} = req.body
        
        const newTime = new BrasileiraoModels(nome,rank,vitorias,derrotas,empates,golsMarcados,golsSofridos,saldoGols,jogosAnteriores,proximosJogos,pontos,posicao,id)
        try {
            await newTime.save()
        } catch (error) {
            res.status(400).json({message:error})
            return
        }
        res.status(201).json({message:'The team Successfully in saved '})
    }

    static async getTimeByName(req, res){
        let time
        let timeName = decodeURIComponent(req.url.replace('/',''))
        timeName = timeName.replace(timeName.charAt(0),timeName.charAt(0).toUpperCase())
        time = await BrasileiraoModels.getTimeByNome(timeName)
        if(time == null){
            res.status(404).json({messsage:'Team was not found'})
            return
        }
        res.json({messsage:'Ok',time})
    }

    static async addGamesInProximosJogos(req, res){
        const {casa,fora,data,horario} = req.body
        await BrasileiraoModels.addGamesInProximosJogosCampeonato(casa,fora,data,horario)
        res.json({message:'OK'})
    }

    static async getGamesByProximosJogosCampeonato(req,res){
        try {
            const proximosJogos = await BrasileiraoModels.getGamesProximosJogosCampeonato()
            res.json({message:"OK",proximosJogos})
        } catch (error) {
            res.json({message:error})
        }
    }

    static async removeGamesProximosJogosCampeonatoByTime(req, res){
        const {horario, data} = req.body
        const proximosJogosCampeonato = await BrasileiraoModels.getGamesProximosJogosCampeonato()
        const horarioInNum = transformingHoursInNumbers(horario)
        proximosJogosCampeonato.map(async (jogo)=>{
            if(transformingHoursInNumbers(jogo.hora) + 200 < horarioInNum){
                await BrasileiraoModels.removeGamesProximosJogosCampeonato(jogo.hora, data)
            }
        })
        res.json({message:"OK!"})
    }

    static async changingTeamStatisticsProximosJogos(req, res){
        const {casa, fora} = req.body
        const objTimeCasa = await BrasileiraoModels.getTimeByNome(casa)
        const objTimeFora = await BrasileiraoModels.getTimeByNome(fora)

        const arrProximosJogosCasa = makeArrayProximosJogos(objTimeCasa.proximosJogos,fora)
        const arrProximosJogosFora = makeArrayProximosJogos(objTimeFora.proximosJogos,casa)

        try {
            await BrasileiraoModels.changingStatisticsProximosJogos(casa,arrProximosJogosCasa)
            await BrasileiraoModels.changingStatisticsProximosJogos(fora,arrProximosJogosFora)
        } catch (error) {
            res.status(400).json({message:error})
            return
            
        }

        res.status(201).json({message:'Successfully in add new adversario '})
    }

    static async getTable(req, res){
        try {
            const table = await BrasileiraoModels.getTable()
            res.json({message:"OK",table})
        } catch (error) {
            res.status(400).json({message:error})
        }
    }

    static async patchTable(req, res){
        const table = await BrasileiraoModels.getTable()
        const updatedtable = table.sort((a,b)=>{
            if(b.pontos != a.pontos)
                return b.pontos - a.pontos
            
            else if(b.vitorias != a.vitorias)
                return b.vitorias - a.vitorias
            // saldo de gols
            else if(b.saldoGols != a.saldoGols)
                return b.saldoGols - a.saldoGols

            // mais gols pro
            else if(b.golsMarcados != a.golsMarcados)
                return b.golsMarcados - a.golsMarcados
        })
        updatedtable.map(async (times,index)=>{
            times.posicao = index+1
            await BrasileiraoModels.updateTable(times)
        })
        

        res.status(201).json({message:'ok'})
    }

    static async changingTeamStatistics(req, res){
        const {fora,casa,golsCasa,golsFora} = req.body
        const golsMarcados = Number(golsCasa) + Number(golsFora)
        let ambosMarca = false
        if(golsCasa > 0 && golsFora > 0) ambosMarca = true
        
        let resultado
        if(golsCasa > golsFora)
            resultado = 'Casa'
        else if(golsCasa == golsFora)
            resultado = 'Empate'
        else
            resultado = 'Fora'
        

        const jogoAnterior = {
            adversario:casa,
            casa,
            fora,
            golsCasa,
            golsFora,
            golsMarcados,
            ambosMarca,
            resultado
        }

        if(jogoAnterior.casa == jogoAnterior.adversario){
            const time = await BrasileiraoModels.getTimeByNome(jogoAnterior.fora)
            if(time == null){
                res.status(404).json({message:'Team not found'})
                return
            }
            let {jogosAnteriores} = time
            time.golsMarcados+= jogoAnterior.golsFora
            time.golsSofridos+= jogoAnterior.golsCasa
            time.saldoGols+= jogoAnterior.golsFora-jogoAnterior.golsCasa
            if(jogoAnterior.resultado == "Fora"){
                time.vitorias+=1
                time.pontos+= 3
            }
            else if(jogoAnterior.resultado == "Empate"){
                time.empates+=1
                time.pontos+=1
            }
            else if(jogoAnterior.resultado == "Casa"){
                time.derrotas+=1
            }

            jogosAnteriores = makeArrayJogosAnteriores(jogosAnteriores, jogoAnterior)
            time.jogosAnteriores = jogosAnteriores
            
            try {
                await BrasileiraoModels.changingStatistics(jogoAnterior.fora, time)
            } catch (error) {
                res.status(400).json({message:error})
                return
            }
        }

        jogoAnterior.adversario = fora

        if(jogoAnterior.casa != jogoAnterior.adversario){
            const time= await BrasileiraoModels.getTimeByNome(jogoAnterior.casa)
            if(time == null){
                res.status(404).json({message:'Team not found'})
                return
            }
            let {jogosAnteriores} = time
            
            time.golsMarcados+= jogoAnterior.golsCasa
            time.golsSofridos+= jogoAnterior.golsFora
            time.saldoGols+= jogoAnterior.golsCasa-jogoAnterior.golsFora
            if(jogoAnterior.resultado == "Casa"){
                time.vitorias+=1
                time.pontos+= 3
            }
            else if(jogoAnterior.resultado == "Empate"){
                time.empates+=1
                time.pontos+=1
            }
            else if(jogoAnterior.resultado == "Fora"){
                time.derrotas+=1
            }
            
            jogosAnteriores = makeArrayJogosAnteriores(jogosAnteriores, jogoAnterior)
            time.jogosAnteriores = jogosAnteriores
            // adicionando array de jogos anteriores atulizados ao db
            try {
                await BrasileiraoModels.changingStatistics(jogoAnterior.casa, time)
            } catch (error) {
                res.status(400).json({message:error})
                return
            }
        }

        res.status(201).json({message:'Successfully changed'})
    }
}