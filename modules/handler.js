const customerRepository = require('../db/customer.repository')
const reservationRepository = require('../db/reservation.repository')
const templateJson = require('./../template.json')
const messageSender = require('./message/index')
const templateMethods = require('./template/index')

const ECustomerStatus = {
    sharePhone : 'sharePhone',
    mainMenu : 'mainMenu',
    datePicker : 'datePicker',
    timePicker : 'timePicher',
    reservationDay : 'reservationDay',
    reservationTime : 'reservationTime',
    reservationDetailedTime : 'reservationDetailedTime',
    reservationTable : 'reservationTable',
}

const EButtonName = {
    reserve : 'reserve',
    reserveList : 'reserveList'
}

const telegramHandler = async (req) => {
    const chatType = req.body.message?.chat?.type;
    if(chatType!=='private'&&!req.body?.callback_query) {
        return {success:true}
    }

    const message = req.body?.message?.chat?.text || req.body?.callback_query?.data
    const phone = req.body?.message?.contact?.phone_number
    const chatId = req.body?.message?.chat?.id|| req.body?.callback_query?.message?.chat?.id
    const username = req.body?.message?.chat?.username

    const existingCustomer = await customerRepository.getCustomer(chatId)
    
    if(!existingCustomer) {
        await customerRepository.addCustomer({chatId,username,status:ECustomerStatus.sharePhone})
        await messageSender.sendMessage(templateJson.greetingMessage, chatId)
        messageSender.sendMessage(templateJson.sharePhone, chatId)
        return {success:true}
    }

    if(phone){
        messageSender.sendMessage(templateJson.mainMenu, chatId)
        await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.mainMenu, phone})
        return {success:true};
    }

    if(message===EButtonName.reserve&&existingCustomer.status===ECustomerStatus.mainMenu){
        const dayTemplate = templateMethods.generateDateMessageTemplate()
        messageSender.sendMessage(dayTemplate, chatId)
        await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationDay})
        return {success:true};
    }

    if(existingCustomer.status===ECustomerStatus.reservationDay){
        const dayRegex = new RegExp(/^(Day_).+$/)
        if(dayRegex.test(message)){
            const timeTemplate = templateMethods.generateTimeMessageTemplate()
            messageSender.sendMessage(timeTemplate, chatId)
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationTime, day:message.slice(4)})
            return {success:true};
        }
    }

    if(existingCustomer.status===ECustomerStatus.reservationDetailedTime){
        const dayRegex = new RegExp(/^(Time_).+$/)
        if(dayRegex.test(message)){
            messageSender.sendMessage(templateJson.tables, chatId)
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationTable, time:message.slice(5)})
            return {success:true};
        }
    }

    if(existingCustomer.status===ECustomerStatus.reservationTable){
        const dayRegex = new RegExp(/^(Table_).+$/)
        if(dayRegex.test(message)){
            await reservationRepository.createReservation({...existingCustomer, table})
            await messageSender.sendMessage(templateJson.reservationSuccess, chatId)
            messageSender.sendMessage(templateJson.mainMenu, chatId)
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.mainMenu})
            return {success:true};
        }
    }

    if(message===EButtonName.reserveList&&existingCustomer.status===ECustomerStatus.mainMenu){
        const reservations = await reservationRepository.getReservation(existingCustomer.id)
        const reservedMessage = templateMethods.generateReservedList(reservations)
        await messageSender.sendMessage(reservedMessage, chatId)
        messageSender.sendMessage(templateJson.mainMenu, chatId)

        return {success:true};
    }

    return {success:true}
}

module.exports = {
    telegramHandler,
}