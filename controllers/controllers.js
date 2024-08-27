const BrasileiraoModels = require('../models/Models')
const puppeteer = require('puppeteer-core')
const chromium = require('chromium');
const { checkVisibility } = require('puppeteer-core/internal/injected/util.js');

function transformingHoursInNumbers(hours){
    hours = hours.toString()
    return Number(hours.replace(':',''))
}

function transformingNumbersInHours(number){
    return number.splice(2,0,":")
    count
}

function transformingDataInNumber (data,element){
    data = data.toString()
    return Number(data.split(element).reverse().join(''))
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

module.exports = class controllers {
    static async addTime(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        const {nome,rank,vitorias,derrotas,empates,golsMarcados,golsSofridos,saldoGols,jogosAnteriores,proximosJogos,pontos,posicao,id} = req.body
        const newTime = new BrasileiraoModels(nome,rank,vitorias,derrotas,empates,golsMarcados,golsSofridos,saldoGols,jogosAnteriores,proximosJogos,pontos,posicao,id)
        try {
            await newTime.save(urlCampeonato)
        } catch (error) {
            res.status(400).json({message:error})
            return
        }
        res.status(201).json({message:'The team Successfully in saved '})
    }

    static async getTimeByName(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        let timeName = decodeURIComponent(req.params.time)
        timeName = timeName.replace(timeName.charAt(0),timeName.charAt(0).toUpperCase())
        let time = await BrasileiraoModels.getTimeByNome(urlCampeonato,timeName)
        if(time == null){
            res.status(404).json({messsage:'Team was not found'})
            return
        }
        res.json({messsage:'Ok',time})
    }

    static async addGamesInProximosJogos(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        urlCampeonato = urlCampeonato.charAt(0).toUpperCase() + urlCampeonato.substring(1)
        const {casa,fora,data,horario} = req.body
        await BrasileiraoModels.addGamesInProximosJogosCampeonato(urlCampeonato,casa,fora,data,horario)
        res.json({message:'OK'})
    }

    static async getGamesByProximosJogosCampeonato(req,res){
        let urlCampeonato = req.baseUrl.replace('/','')
        urlCampeonato = urlCampeonato.charAt(0).toUpperCase() + urlCampeonato.substring(1)
        try {
            const proximosJogos = await BrasileiraoModels.getGamesProximosJogosCampeonato(urlCampeonato)
            res.json(({message:'OK',proximosJogos}))    
        } catch (error) {
            res.status(400).json({message:error})   
        }
    }

    static async setResultProximosJogos(req,res){
        let urlCampeonato = req.baseUrl.replace('/','')
        urlCampeonato = urlCampeonato.charAt(0).toUpperCase() + urlCampeonato.substring(1) 
        try {
            const proximosJogos = await BrasileiraoModels.getGamesProximosJogosCampeonato(urlCampeonato)
            proximosJogos.map( async (jogo)=>{
                let timeCasa = jogo.casa
                let timeFora = jogo.fora
                timeCasa = timeCasa.replace(' ','+')
                timeFora = timeFora.replace(' ','+')
                const searchUrl = `https://www.google.com/search?client=opera-gx&q=${timeCasa}+x+${timeFora}&sourceid=opera&ie=UTF-8&oe=UTF-8`
                const browser = await puppeteer.launch({headless:true,executablePath: chromium.path});
                const page = await browser.newPage();
                await page.goto(searchUrl);
                const encerrado = await page.evaluate(() => document.querySelector(".imso_mh__ft-mtch.imso-medium-font.imso_mh__ft-mtchc")? true : false)
                if(encerrado){
                    let golsCasa = Number(await page.evaluate(() =>  document.querySelector(".imso_mh__l-tm-sc")?.textContent))
                    let golsFora = Number(await page.evaluate(()=> document.querySelector('.imso_mh__r-tm-sc')?.textContent))
                    await browser.close()
                    await BrasileiraoModels.setResultProximosJogosCameponato(urlCampeonato,jogo._id,golsCasa,golsFora,encerrado)
                }else{
                    await browser.close()
                }
            })   
            res.json({message:"OK"})   
        } catch (error) {
            res.status(400).json({message:error})   
        }
    }

    static async changingPositionTable(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        try {
            const times = await BrasileiraoModels.getTable(urlCampeonato)
            let updatedtable = times.sort((a,b)=>{
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
            updatedtable.map(async (time,index)=>{
                await BrasileiraoModels.changingPositionTable(urlCampeonato,time.nome,index+1)
            })
            
            res.json({message:"OK"})
        } catch (error) {
            res.status(400).json({message:error})
        }
        
    }

    static async removeGamesProximosJogosCampeonatoByTime(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        urlCampeonato = urlCampeonato.charAt(0).toUpperCase() + urlCampeonato.substring(1) 
        let {hora,data} = req.params
        const proximosJogos = await BrasileiraoModels.getGamesProximosJogosCampeonato(urlCampeonato)
        // so vai tirar o jogo do banco de dados um dia dps
        proximosJogos.map(async (jogo)=>{
            const dataAtual = transformingDataInNumber(data, ' ')
            let dataJogo = transformingDataInNumber(jogo.data, '/')
            if(dataAtual > dataJogo){
                await BrasileiraoModels.removeGamesProximosJogosCampeonato(urlCampeonato,jogo.hora)
            }
        })
       
        
        res.json({message:"OK!"})
    }

    static async changingTeamStatisticsProximosJogos(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        const {casa, fora} = req.body
        const objTimeCasa = await BrasileiraoModels.getTimeByNome(urlCampeonato,casa)
        const objTimeFora = await BrasileiraoModels.getTimeByNome(urlCampeonatos,fora)

        const arrProximosJogosCasa = makeArrayProximosJogos(objTimeCasa.proximosJogos,fora)
        const arrProximosJogosFora = makeArrayProximosJogos(objTimeFora.proximosJogos,casa)

        try {
            await BrasileiraoModels.changingStatisticsProximosJogos(urlCampeonato,casa,arrProximosJogosCasa)
            await BrasileiraoModels.changingStatisticsProximosJogos(urlCampeonato,fora,arrProximosJogosFora)
        } catch (error) {
            res.status(400).json({message:error})
            return
        }

        res.status(201).json({message:'Successfully in add new adversario '})
    }

    static async getTable(req, res){
        const urlCampeonato = req.baseUrl.replace('/','')
        try {
            const table = await BrasileiraoModels.getTable(urlCampeonato)
            let updatedtable = table.sort((a,b)=>{
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
            updatedtable.map(async (time,index)=>{
                time.posicao = index+1
            })
            res.json({message:"OK",table:updatedtable})
        } catch (error) {
            res.status(400).json({message:error})
        }
    }

    static async changingTeamStatistics(req, res){
        let urlCampeonato = req.baseUrl.replace('/','')
        urlCampeonato = urlCampeonato.charAt(0).toUpperCase() + urlCampeonato.substring(1)
        const proximosJogos = await BrasileiraoModels.getGamesProximosJogosCampeonato(urlCampeonato)
        urlCampeonato = urlCampeonato.charAt(0).toLowerCase() + urlCampeonato.substring(1)
        proximosJogos.map(async (jogo)=>{
        let timeCasa = jogo.casa.replace(' ','+')
        let timeFora = jogo.fora.replace(' ','+')
        let data = jogo.data.replace('/', '%2F')
        let golsCasa
        let golsFora
        const searchUrl = `https://www.google.com/search?client=opera-gx&q=${timeCasa}+x+${timeFora}+${data}&sourceid=opera&ie=UTF-8&oe=UTF-8`
        const browser = await puppeteer.launch({headless:true,executablePath: chromium.path});
        const page = await browser.newPage();
        await page.goto(searchUrl);
        
        const encerrado = await page.evaluate(() => document.querySelector(".imso_mh__ft-mtch.imso-medium-font.imso_mh__ft-mtchc")? true : false)
        if(encerrado){
            golsCasa = Number(await page.evaluate(() =>  document.querySelector(".imso_mh__l-tm-sc")?.textContent))
            golsFora = Number(await page.evaluate(()=> document.querySelector('.imso_mh__r-tm-sc')?.textContent))
            await browser.close()
        }else{
            await browser.close()
            return
        }
        jogo['golsCasa'] = golsCasa
        jogo['golsFora'] = golsFora
        timeCasa = timeCasa.replace('+',' ')
        timeFora = timeFora.replace('+',' ')
    
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
            adversario:timeCasa,
            casa:timeCasa,
            fora:timeFora,
            golsCasa,
            golsFora,
            golsMarcados,
            ambosMarca,
            resultado
        }
    
        if(jogoAnterior.casa == jogoAnterior.adversario){
            const time = await BrasileiraoModels.getTimeByNome(urlCampeonato,jogoAnterior.fora)
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
                await BrasileiraoModels.changingStatistics(urlCampeonato,jogoAnterior.fora, time)
            } catch (error) {
                res.status(400).json({message:error})
                return
            }
        }
        jogoAnterior.adversario = timeFora
    
        if(jogoAnterior.casa != jogoAnterior.adversario){
            const time= await BrasileiraoModels.getTimeByNome(urlCampeonato,jogoAnterior.casa)
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
                await BrasileiraoModels.changingStatistics(urlCampeonato,jogoAnterior.casa, time)
            } catch (error) {
                res.status(400).json({message:error})
                return
            }
        }
        })
        
    
        res.status(201).json({message:'Successfully changed'})
    }
}