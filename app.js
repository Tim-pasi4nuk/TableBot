const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

const telegramHandler = require('./modules/telegram/handler');

api.post('/webhook', telegramHandler);

module.exports = api;
