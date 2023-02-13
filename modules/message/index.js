const telegram = require('../telegram/index')
const config = require('../../configs/index')

const botToken = config.getConfig().botToken;

const sendMessage = async (messageTemplate, chat_id) => {
    await telegram.sendToTelegram(botToken, {...messageTemplate, chat_id})
}

module.exports = {
    sendMessage
}