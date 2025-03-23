const { API_URL, currencies } = require('./constants')
const { sendMessageToGroup } = require('./telegram-bot')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const sendTlData = async (previousShapesData, index) => {
	const tl = previousShapesData.map(previousShapeData => {
		const { isValid, ...newPreviousShapeData } = previousShapeData // Извлекаем все свойства, кроме isValid
		return newPreviousShapeData
	})

	const now = new Date()
	const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
		.toString()
		.padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
		.getHours()
		.toString()
		.padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
		.getSeconds()
		.toString()
		.padStart(2, '0')}`

	const data = {
		currencie: currencies[index],
		tl,
		timestamp,
	}

	try {
		const response = await fetch(`${API_URL}/data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		const result = await response.json()
		console.log('✅ Ответ от сервера:', result)

		return result
	} catch (error) {
		console.error('❌ Ошибка отправки данных:', error)
		await sendMessageToGroup(
			`${currencies[index]} :❌ Ошибка отправки данных: ${error}`
		)
	}
}

module.exports = {
	delay,
	sendTlData,
}
