const config = require('..//../configs/index')

const reservedDayLimit = config.getConfig().reservedDayLimit;
const startTime = config.getConfig().startTime
const endTime = config.getConfig().endTime

const generateDaysArray = () => {
    let days = []

    for (let index = 0; index < reservedDayLimit; index++) {
        let dateNow = new Date(Date.now())

        dateNow.setDate(dateNow.getDate() + index)

        const currentDay = dateNow.getDate()
        const month = dateNow.getMonth()

        days.push(`${currentDay}.${month<10 ? 0 : ''}${month}`)
    }
    
    return days;
}

const generateDateMessageTemplate = () => {
    const daysArray = generateDaysArray()

    const dateMessageTemplates = daysArray.map(day => {
        return [{
            "text": `${day}`,
            "callback_data": `day_${day}`
        }]
    });

    return { 
        "text": "Choose day for reservation",
        "reply_markup": {
            "inline_keyboard": 
                    dateMessageTemplates
            
        }
    }
}

const generateTimeArray = () => {
    const timeArray = []
    for (let hour = startTime; start < endTime; hour++) {

        for(let start = 0; start < 4; start++){

            const hourWithMinute = `${hour}:${ start*15 || '00'}`

            timeArray.push({
                "text":hourWithMinute, 
                "callback_data": `Time_${hourWithMinute}`
            })
        }
    }
}

const generateTimeMessageTemplate = () => {
    const timeArray = generateTimeArray()

    return { 
        "text": "Choose time for reservation",
        "reply_markup": {
            "inline_keyboard": 
                timeArray
            
        }
    }
}

const generateReservedList = (reservations) => {
    const reservedList = reservations.map((reservation)=> {
        return `\nTable:${reservation.table}, ${reservation.day} ${reservation.time}`;
    }) 
    return {
        "text": `You reserved: ${reservedList}`,
    }
}

module.exports = {
    generateDateMessageTemplate,
    generateTimeMessageTemplate,
    generateReservedList
}