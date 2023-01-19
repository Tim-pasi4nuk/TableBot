const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

const handler = require('./modules/handler');

api.post('/webhook', handler.telegramHandler);

module.exports = api;
