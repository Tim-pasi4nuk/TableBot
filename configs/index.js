require('dotenv').config()

function getConfig() {
  return {
    mongodbUrl: process.env[`MONGODBURL`],
    botToken: process.env[`BOTTOKEN`],
    reservedDayLimit: process.env[`RESERVEDDAYLIMIT`]
  };
}

module.exports = {
  getConfig
};
