// 🔍 Поиск кнопки с aria-label="Object Tree and Data Window"
const checkIsObjectTreeButton = async page => {
	const buttonExists = await page.evaluate(() => {
		const xpath = "//button[@aria-label='Object Tree and Data Window']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		return result.singleNodeValue !== null // true, если кнопка найдена
	})

	return buttonExists
}

const checkIsObjectTreeButtonActive = async page => {
	const ariaPressed = await page.evaluate(() => {
		const button = document.querySelector(
			"button[aria-label='Object Tree and Data Window']"
		)
		return button ? button.getAttribute('aria-pressed') : null
	})

	return ariaPressed
}

// 🔍 Поиск кнопки с aria-label="Object Tree and Data Window"
const checkIsDataWindowButton = async page => {
	const dataWindowButtonExists = await page.evaluate(() => {
		const xpath = "//span[contains(text(), 'Data Window')]" // Ищем span с нужным текстом
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const spanElement = result.singleNodeValue
		if (spanElement) {
			const button = spanElement.closest('button') // Находим родительский <button>
			if (button) {
				return button.getAttribute('aria-selected') // Возвращаем значение атрибута aria-selected
			}
		}
		return null // Если не найдено, возвращаем null
	})

	return dataWindowButtonExists
}

module.exports = {
	checkIsObjectTreeButton,
	checkIsObjectTreeButtonActive,
	checkIsDataWindowButton,
}
