const axios = require('axios');

const instanse = axios.create({baseURL:'https://api.telegram.org'})

const sendToTelegram = async (botToken, message) => {
    try{
        await instanse.post(`/bot${botToken}/sendMessage`, message)
    } catch(e){
        console.log(e)
    }
}

module.exports = {
    sendToTelegram
}