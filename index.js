const puppeteer = require('puppeteer')
const { cookies, urls } = require('./constants')
const { delay, sendTlData } = require('./share')
const {
	findObjectTreeButtonData,
	doObjectTreeButtonActive,
	findDataWindowButtonData,
	doDataWindowButtonActive,
} = require('./core')

;(async () => {
	for (let index = 0; index < urls.length; index++) {
		const url = urls[index]

		const browser = await puppeteer.launch({
			headless: false,
			args: ['--start-maximized'],
		})
		const page = await browser.newPage()

		// Устанавливаем cookies для авторизации

		await page.setCookie(...cookies)

		console.log('✅ Авторизация через cookies успешна!')

		const [width, height] = [1920, 1080]
		await page.setViewport({ width, height })

		await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 0,
		})

		// 🔍 Ищем кнопку Object Tree and Data Window один раз и получаем её атрибут aria-pressed
		const objectTreeButtonData = await findObjectTreeButtonData(page)

		// если кнопка Object Tree and Data Window найдена
		if (objectTreeButtonData.found) {
			console.log('✅ Кнопка "Object Tree and Data Window" найдена!')

			// проверяем активна ли Object Tree and Data Window
			if (objectTreeButtonData.ariaPressed === 'false') {
				console.log('⚡ Кнопка не активна, кликаем...')

				// Кликаем по кнопке через XPath
				await doObjectTreeButtonActive(page, objectTreeButtonData)
				console.log('✅ Кнопка активирована!')
			} else {
				console.log('✅ Кнопка уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Object Tree and Data Window" не найдена!')
		}
		// 🔍 Ищем кнопку "Data Window" один раз и получаем её атрибут aria-selected
		const dataWindowButtonData = await findDataWindowButtonData(page)

		// если кнопка Data Window найдена
		if (dataWindowButtonData.found) {
			console.log('✅ Кнопка "Data Window" найдена!')

			// проверяем активна ли кнопка Data Window
			if (dataWindowButtonData.ariaSelected === 'false') {
				console.log('⚡ Кнопка "Data Window" не активна, кликаем...')

				// Кликаем по кнопке через XPath
				await doDataWindowButtonActive(page, dataWindowButtonData)
				console.log('✅ Кнопка "Data Window" активирована!')
			} else {
				console.log('✅ Кнопка "Data Window" уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Data Window" не найдена!')
		}
		return
		// 🔍 ищем индикатор "TL 1.0" на панели
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

		// есть ли индикатор "TL 1.0" на панели
		if (tl1Indicator.found) {
			console.log('✅ Спан с текстом "TL 1.0" найден!')
		} else {
			console.log('❌ Спан с текстом "TL 1.0" не найден!')

			// 🔍 Ищем кнопку для выбора индикаторов
			const chooseIndicatorButtonData = await page.evaluate(() => {
				const xpath =
					"//button[@aria-label='Indicators, metrics, and strategies']"
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

			// если нашли кнопку для выбора индикаторов
			if (chooseIndicatorButtonData.found) {
				console.log('✅ Кнопка "Indicators, metrics, and strategies" найдена!')

				// Кликаем по кнопке через XPath
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

				console.log(
					'✅ Кнопка "Indicators, metrics, and strategies" активирована!'
				)

				// 🔍 Бесконечный цикл поиска вкладки "Invite-only"
				while (true) {
					console.log('⏳ Ищем элемент "Invite-only"...')

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

					if (inviteOnlyData.found) {
						console.log('✅ Элемент "Invite-only" найден и кликнут!')
						break
					}

					console.log(
						'❌ Элемент "Invite-only" не найден, повторяем через 2 секунды...'
					)
					await delay(2000)
				}

				// 🔍 Проверяем и кликаем по "Indicator - TL 1.0"
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
						const indicatorElementTextXpath =
							".//span[text()='Indicator - TL 1.0']" // Используем локальный XPath относительно div
						const indicatorElementTextResult = document.evaluate(
							indicatorElementTextXpath,
							indicatorElement,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const indicatorElementText =
							indicatorElementTextResult.singleNodeValue

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
						const indicatorElementLink =
							indicatorElementLinkResult.singleNodeValue

						const isIndicatorElementLinkCorrect = indicatorElementLink !== null

						if (
							isIndicatorElementTextCorrect &&
							isIndicatorElementLinkCorrect
						) {
							indicatorElement.click() // Кликаем по div, если оба условия выполнены
							return { found: true }
						}
					}

					return { found: false }
				})

				if (indicatorData.found) {
					console.log('✅ Элемент "Indicator - TL 1.0" найден и кликнут!')

					// 🔍 Ищем кнопку закрытия выбора индикаторов
					const closeIndicatorsButtonData = await page.evaluate(() => {
						const xpath = "//button[@data-name='close']"
						const result = document.evaluate(
							xpath,
							document,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const closeIndicatorsButton = result.singleNodeValue

						if (closeIndicatorsButton) {
							closeIndicatorsButton.click()
							return { found: true }
						}
						return { found: false }
					})

					if (closeIndicatorsButtonData.found) {
						console.log('✅ Кнопка "Close" нажата.')
					} else {
						console.log('❌ Кнопка "Close" не найдена.')
					}
				} else {
					console.log('❌ Элемент "Indicator - TL 1.0" не найден.')
				}
			} else {
				console.error(
					'❌ Кнопка "Indicators, metrics, and strategies" не найдена!'
				)
			}
		}

		// Ожидаемые цвета по индексам
		const expectedColors = [
			'rgb(255, 82, 82)', // 1, 5
			'rgb(255, 152, 0)', // 2, 6
			'rgb(76, 175, 80)', // 3, 7
			'rgb(49, 27, 146)', // 4, 8
		]

		// Функция для получения значений всех span внутри родительских div с "Shapes"
		const getShapesData = async () => {
			return await page.evaluate(expectedColors => {
				const xpath = "//div[contains(text(), 'Shapes')]"
				const result = document.evaluate(
					xpath,
					document,
					null,
					XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
					null
				)

				const shapesData = []

				for (
					let i = 0;
					i < result.snapshotLength && shapesData.length < 8;
					i++
				) {
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
		}

		// Функция проверки соответствия цветов
		const validateColors = shapesData => {
			let isAllElementsValid = true

			shapesData.forEach((shapeData, index) => {
				if (shapeData.isValid) {
					console.log(
						`✅ Элемент ${index + 1} соответствует: ${
							shapeData.color
						}, текст: "${shapeData.text}"`
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

		// 🔥 Первичная проверка цветов
		let previousShapesData = await getShapesData()
		console.log('📊 Начальные значения span:', previousShapesData)
		const isValidColorOfElements = validateColors(previousShapesData)

		if (isValidColorOfElements) {
			await sendTlData(previousShapesData, index)
		}

		// 🔄 Проверяем изменения каждые 20 мс
		setInterval(async () => {
			const currentShapesData = await getShapesData()

			// Проверяем изменения
			let hasChanges = false

			currentShapesData.forEach((currentShapeData, index) => {
				if (
					currentShapeData.color !== previousShapesData[index]?.color ||
					currentShapeData.text !== previousShapesData[index]?.text
				) {
					hasChanges = true
				}
			})

			// Если были изменения, проверяем цвета
			if (hasChanges) {
				console.log('tl изменился: ')
				console.log(currentShapesData)
				const isValidColorOfElements = validateColors(currentShapesData)
				previousShapesData = currentShapesData

				if (isValidColorOfElements) {
					await sendTlData(previousShapesData, index)
				}
			}
		}, 20)

		await delay(3000)
	}
})()
