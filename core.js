const { expectedColors, currencies } = require('./constants')
const { sendMessageToGroup } = require('./telegram-bot')

const findObjectTreeButtonData = async page => {
	const objectTreeButtonData = await page.evaluate(() => {
		const xpath = "//button[@aria-label='Object Tree and Data Window']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const objectTreeButton = result.singleNodeValue

		if (objectTreeButton) {
			return {
				found: true,
				ariaPressed: objectTreeButton.getAttribute('aria-pressed'),
				xpath: xpath, // Сохраняем XPath, чтобы потом кликнуть
			}
		}
		return { found: false }
	})

	return objectTreeButtonData
}

const doObjectTreeButtonActive = async (page, objectTreeButtonData) => {
	await page.evaluate(xpath => {
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const objectTreeButton = result.singleNodeValue
		if (objectTreeButton) objectTreeButton.click()
	}, objectTreeButtonData.xpath)
}

const findDataWindowButtonData = async page => {
	const dataWindowButtonData = await page.evaluate(() => {
		const xpath = "//button[@id='data-window']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const dataWindowButton = result.singleNodeValue

		if (dataWindowButton) {
			return {
				found: true,
				ariaSelected: dataWindowButton.getAttribute('aria-selected'),
				xpath: xpath, // Сохраняем XPath, чтобы потом кликнуть
			}
		}
		return { found: false }
	})

	return dataWindowButtonData
}

const doDataWindowButtonActive = async (page, dataWindowButtonData) => {
	await page.evaluate(xpath => {
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const dataWindowButton = result.singleNodeValue
		if (dataWindowButton) dataWindowButton.click()
	}, dataWindowButtonData.xpath)
}

const findTl1Indicator = async page => {
	const tl1Indicator = await page.evaluate(() => {
		const xpath = "//span[contains(text(), 'TL 1.0')]"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		return { found: result.singleNodeValue !== null }
	})

	return tl1Indicator
}

const findChooseIndicatorButtonData = async page => {
	const chooseIndicatorButtonData = await page.evaluate(() => {
		const xpath = "//button[@aria-label='Indicators, metrics, and strategies']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const chooseIndicatorButton = result.singleNodeValue
		return {
			found: chooseIndicatorButton !== null,
			xpath: xpath,
		}
	})

	return chooseIndicatorButtonData
}

const doChooseIndicatorButtonActive = async (
	page,
	chooseIndicatorButtonData
) => {
	await page.evaluate(xpath => {
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const chooseIndicatorButton = result.singleNodeValue
		if (chooseIndicatorButton) chooseIndicatorButton.click()
	}, chooseIndicatorButtonData.xpath)
}

const findInviteOnlyData = async page => {
	const inviteOnlyData = await page.evaluate(() => {
		const xpath = "//span[contains(text(), 'Invite-only')]"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const inviteOnlyText = result.singleNodeValue

		if (inviteOnlyText) {
			const inviteOnlyTab = inviteOnlyText.closest('div')
			if (inviteOnlyTab) {
				inviteOnlyTab.click()
				return { found: true }
			}
		}
		return { found: false }
	})

	return inviteOnlyData
}

const findIndicatorData = async page => {
	const indicatorData = await page.evaluate(() => {
		const xpath = "//div[@data-title='Indicator - TL 1.0']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const indicatorElement = result.singleNodeValue

		if (indicatorElement) {
			// Ищем span с текстом "Indicator - TL 1.0" через XPath
			const indicatorElementTextXpath = ".//span[text()='Indicator - TL 1.0']" // Используем локальный XPath относительно div
			const indicatorElementTextResult = document.evaluate(
				indicatorElementTextXpath,
				indicatorElement,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			)
			const indicatorElementText = indicatorElementTextResult.singleNodeValue

			// Проверяем, найден ли нужный span
			const isIndicatorElementTextCorrect = indicatorElementText !== null

			// Ищем ссылку <a> с href="/u/igoraa500/" через XPath
			const indicatorElementLinkXpath = ".//a[@href='/u/igoraa500/']" // Используем локальный XPath относительно div
			const indicatorElementLinkResult = document.evaluate(
				indicatorElementLinkXpath,
				indicatorElement,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			)
			const indicatorElementLink = indicatorElementLinkResult.singleNodeValue

			const isIndicatorElementLinkCorrect = indicatorElementLink !== null

			if (isIndicatorElementTextCorrect && isIndicatorElementLinkCorrect) {
				indicatorElement.click() // Кликаем по div, если оба условия выполнены
				return { found: true }
			}
		}

		return { found: false }
	})

	return indicatorData
}

// 🔍 Функция для поиска кнопки закрытия индикаторов
const findCloseIndicatorsButtonData = async page => {
	const closeButtonData = await page.evaluate(() => {
		const xpath = "//button[@data-name='close']"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const closeButton = result.singleNodeValue

		if (closeButton) {
			return {
				found: true,
				xpath: xpath, // Сохраняем XPath, чтобы потом кликнуть
			}
		}
		return { found: false }
	})

	return closeButtonData
}

// 🔘 Функция для клика по кнопке закрытия
const clickCloseIndicatorsButton = async (page, closeButtonData, index) => {
	await page.evaluate(xpath => {
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)
		const closeButton = result.singleNodeValue
		if (closeButton) closeButton.click()
	}, closeButtonData.xpath)

	console.log('✅ Кнопка "Close" нажата.')
	await sendMessageToGroup(`${currencies[index]} :✅ Кнопка "Close" нажата.`)
}

// Функция для получения значений всех span внутри родительских div с "Shapes"
const getShapesData = async page => {
	const shapesData = await page.evaluate(expectedColors => {
		const xpath = "//div[contains(text(), 'Shapes')]"
		const result = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
			null
		)

		const shapesData = []

		for (let i = 0; i < result.snapshotLength && shapesData.length < 8; i++) {
			const shapesDataParent = result.snapshotItem(i)
			if (!shapesDataParent || !shapesDataParent.parentElement) continue

			const shapesDataValue =
				shapesDataParent.parentElement.querySelector('span')
			if (shapesDataValue) {
				const color = shapesDataValue.style.color
				const text = shapesDataValue.innerText.trim()
				const expectedColor = expectedColors[i % 4] // Цвет по шаблону
				const isValid = color === expectedColor // Проверка соответствия

				shapesData.push({ color, text, isValid })
			}
		}

		return shapesData
	}, expectedColors)

	return shapesData
}

// Функция проверки соответствия цветов
const validateColors = shapesData => {
	let isAllElementsValid = true

	shapesData.forEach((shapeData, index) => {
		if (shapeData.isValid) {
			console.log(
				`✅ Элемент ${index + 1} соответствует: ${shapeData.color}, текст: "${
					shapeData.text
				}"`
			)
		} else {
			isAllElementsValid = false

			console.error(
				`❌ Ошибка! Элемент ${index + 1}: ожидался цвет ${
					expectedColors[index % 4]
				}, но получен ${shapeData.color}`
			)
		}
	})

	return isAllElementsValid
}

module.exports = {
	findObjectTreeButtonData,
	doObjectTreeButtonActive,
	findDataWindowButtonData,
	doDataWindowButtonActive,
	findTl1Indicator,
	findChooseIndicatorButtonData,
	doChooseIndicatorButtonActive,
	findInviteOnlyData,
	findIndicatorData,
	findCloseIndicatorsButtonData,
	clickCloseIndicatorsButton,
	getShapesData,
	validateColors,
}
