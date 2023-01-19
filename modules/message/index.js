const telegram = require('../telegram/index')
const config = require('../../configs/index')

const botToken = config.getConfig().botToken;

const sendMessage = (messageTemplate, chat_id) => {
    telegram.sendToTelegram(botToken, {...messageTemplate, chat_id})
}

module.exports = {
    sendMessage
}