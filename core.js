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
}
