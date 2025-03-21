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
	page.evaluate(xpath => {
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

module.exports = {
	findObjectTreeButtonData,
	doObjectTreeButtonActive,
	findDataWindowButtonData,
	doDataWindowButtonActive,
}
