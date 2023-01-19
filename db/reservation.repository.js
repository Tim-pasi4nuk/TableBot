const connectToDatabase = require('./index');

const getReservation = async (customerId) => {
    const db = await connectToDatabase();
  
    const reservations = await db.collection('resevation').find({customerId:customerId}).toArray();
  
    return reservations;
};

const createReservation = async ({day, time, table, customerId}) => {
    const db = await connectToDatabase();
  
    const reservation = await db.collection('resevation').insertOne({customerId:customerId,day:day, time:time, table:table});
  
    return reservation;
}

module.exports = {
    getReservation,
    createReservation
}
