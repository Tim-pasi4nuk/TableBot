const database = require('./index');

const addCustomer = async (customer) => {

    customer.status = 'welcome'
  
    const db = await database.connectToDatabase();
  
    const customers = await db.collection('customer').insertOne(customer);
  
    return customers;
};

const getCustomer = async (chatId) => {  
    const db = await database.connectToDatabase();
    
    const customers = await db.collection('customer').findOne({chatId:chatId});
    
    return customers;
};

const updateCustomer = async (chatId, {status, phone, day, time}) => {
    const db = await database.connectToDatabase();

    const customers = await db.collection('customer').updateOne({chatId:chatId}, {$set: {status:status, phone:phone, day:day, time:time}});
    
    return customers;
}

module.exports = {
    addCustomer, getCustomer, updateCustomer
}