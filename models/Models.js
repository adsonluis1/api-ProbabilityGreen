const client = require('../db/conn')

class ProximosJogos {
    constructor(casa,fora,data,hora){
        this.casa = casa
        this.fora = fora
        this.data = data
        this.hora = hora 
    }
}

module.exports = class Models {
    constructor(nome,rank,vitorias,derrotas,empates,golsMarcados,golsSofridos,saldoGols,jogosAnteriores,proximosJogos,pontos,posicao,id){
        this.nome = nome
        this.rank= rank
        this.vitorias = vitorias
        this.derrotas = derrotas
        this.empates = empates
        this.golsMarcados = golsMarcados
        this.golsSofridos = golsSofridos
        this.saldoGols = saldoGols
        this.jogosAnteriores = jogosAnteriores
        this.proximosJogos = proximosJogos
        this.pontos = pontos
        this.posicao = posicao
        this.id = id
    }

    static async getTimeByNome(urlCampeonato, nome){
        try {
            return await client.db('probabilityGreen').collection(urlCampeonato).findOne({nome:nome})
        } catch (error) {
            return error
        }
    }

    static async getGamesProximosJogosCampeonato(urlCampeonato){
        return await client.db('probabilityGreen').collection(`proximosJogos${urlCampeonato}`).find().toArray()
    }

    static async setResultProximosJogosCameponato(urlCampeonato,idJogo,golsCasa,golsFora,encerrado){
        await client.db('probabilityGreen').collection(`proximosJogos${urlCampeonato}`).updateOne({_id:idJogo},{$set:{encerrado:encerrado,golsCasa:golsCasa,golsFora:golsFora}})
    }

    static async addGamesInProximosJogosCampeonato(urlCampeonato,casa,fora,data,horario){
        const proximoJogosBrasileiraoA = new ProximosJogos(casa,fora,data,horario)
        await client.db('probabilityGreen').collection(`proximosJogos${urlCampeonato}`).insertOne(proximoJogosBrasileiraoA)
    }

    static async removeGamesProximosJogosCampeonato(urlCampeonato,horarioGame){
        await client.db('probabilityGreen').collection(`proximosJogos${urlCampeonato}`).deleteOne({hora:horarioGame})
    }

    static async getTable(urlCampeonato){
        try {
            return await client.db('probabilityGreen').collection(urlCampeonato).find().toArray()
        } catch (error) {
            console.log(error)
        }
    }
    
    static async changingPositionTable(urlCampeonato,timeNome,timePosicao){
        await client.db('probabilityGreen').collection(urlCampeonato).updateOne({nome:timeNome},{$set:{posicao:timePosicao}})
    }

    static async updateTable(time){
        await client.db('probabilityGreen').collection('brasileiraoA').updateOne({nome:time.nome},{$set:{posicao:time.posicao}}).catch((err)=>{
            console.log(err)
        })
    }

    static async changingStatistics(urlCampeonato,timeNome, updatedTime){
        await client.db('probabilityGreen').collection(urlCampeonato).updateOne({nome:timeNome},{$set:updatedTime})
    }

    static async changingStatisticsProximosJogos (urlCampeonato,timeNome,proximosJogos){
        await client.db('probabilityGreen').collection(urlCampeonato).updateOne({nome:timeNome},{$set:{proximosJogos:proximosJogos}})
    }

    async save(urlCampeonato){
        await client.db('probabilityGreen').collection(urlCampeonato).insertOne(this)
    }
}