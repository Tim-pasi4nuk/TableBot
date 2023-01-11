const telegramHandler = async (req) => {
    console.log(req)
    return {success: 200}
}

module.exports = {
    telegramHandler,
}