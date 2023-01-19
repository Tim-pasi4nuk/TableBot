require('dotenv').config()

function getConfig() {
  return {
    mongodbUrl: process.env[`MONGODBURL`],
    botToken: process.env[`BOTTOKEN`],
    reservedDayLimit: process.env[`RESERVEDDAYLIMIT`],
    startTime: process.env[`STARTTIME`],
    endTime: process.env[`ENDTIME`],
  };
}

module.exports = {
  getConfig
};
