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
    if(chatType!=='private') {
        return {success:true}
    }

    const message = req.body?.message?.chat?.text
    const phone = req.body?.message.contact.phone_number
    const chatId = req.body.message?.chat?.id
    const username = req.body.message?.chat?.username

    const existingCustomer = await customerRepository.getCustomer(chatId)
    
    if(!existingCustomer) {
        await customerRepository.addCustomer({chatId,username,status:ECustomerStatus.sharePhone})
        messageSender.sendMessage(templateJson.greetingMessage, chatId)
        messageSender.sendMessage(templateJson.sharePhone, chatId)
        return {success:true}
    }

    if(phone){
        await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.mainMenu, phone})
        messageSender.sendMessage(templateJson.mainMenu, chatId)
        return {success:true};
    }

    if(message.text===EButtonName.reserve&&existingCustomer.status===ECustomerStatus.mainMenu){
        await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationDay})
        const dayTemplate = templateMethods.generateDateMessageTemplate()
        messageSender.sendMessage(dayTemplate, chatId)
        return {success:true};
    }

    if(existingCustomer.status===ECustomerStatus.reservationDay){
        const dayRegex = new RegExp(/^(Day_).+$/)
        if(dayRegex.test(message.text)){
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationTime, day:message.text.slice(4)})
            const timeTemplate = templateMethods.generateTimeMessageTemplate()
            messageSender.sendMessage(timeTemplate, chatId)
            return {success:true};
        }
    }

    if(existingCustomer.status===ECustomerStatus.reservationDetailedTime){
        const dayRegex = new RegExp(/^(Time_).+$/)
        if(dayRegex.test(message.text)){
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.reservationTable, time:message.text.slice(5)})
            messageSender.sendMessage(templateJson.tables, chatId)
            return {success:true};
        }
    }

    if(existingCustomer.status===ECustomerStatus.reservationTable){
        const dayRegex = new RegExp(/^(Table_).+$/)
        if(dayRegex.test(message.text)){
            await customerRepository.updateCustomer(chatId,{status:ECustomerStatus.mainMenu})
            await reservationRepository.createReservation({...existingCustomer, table})
            messageSender.sendMessage(templateJson.reservationSuccess, chatId)
            messageSender.sendMessage(templateJson.mainMenu, chatId)
            return {success:true};
        }
    }

    if(message.text===EButtonName.reserveList&&existingCustomer.status===ECustomerStatus.mainMenu){
        const reservations = await reservationRepository.getReservation(existingCustomer.id)
        const reservedMessage = templateMethods.generateReservedList(reservations)
        messageSender.sendMessage(reservedMessage, chatId)
        messageSender.sendMessage(templateJson.mainMenu, chatId)

        return {success:true};
    }

    return {success:true}
}

module.exports = {
    telegramHandler,
}