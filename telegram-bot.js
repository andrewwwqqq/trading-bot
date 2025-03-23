const { Telegraf } = require('telegraf')

const BOT_TOKEN = '7415691755:AAGABMOrnw2LAj3XRmw6KTZE6axCBhSNEys'
const CHAT_ID = '-1002563526548'

const bot = new Telegraf(BOT_TOKEN)
const chatId = CHAT_ID

// Отправка сообщения в группу
const sendMessageToGroup = async message => {
	try {
		await bot.telegram.sendMessage(chatId, message)
		console.log('✅ Сообщение отправлено!')
	} catch (error) {
		console.error('❌ Ошибка отправки:', error)
	}
}

// Обработчик команд
bot.start(ctx => ctx.reply('Привет! Я бот.'))

// Запуск бота
bot.launch()
console.log('🤖 Бот запущен!')

module.exports = {
	sendMessageToGroup,
}
