const puppeteer = require('puppeteer')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const API_URL = 'http://localhost:3000' // Укажи URL сервера

;(async () => {
	const urls = [
		'https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7',
		// 'https://www.tradingview.com/chart/?symbol=BINANCE:ADAUSDT&interval=7',
	]

	const currencies = ['AVAXUSDT', 'ADAUSDT']

	for (let index = 0; index < urls.length; index++) {
		const url = urls[index]

		const browser = await puppeteer.launch({
			headless: false,
			args: ['--start-maximized'],
		})
		const page = await browser.newPage()

		// Устанавливаем cookies для авторизации
		const cookies = [
			{
				name: 'sessionid',
				value: 'eictbpvvxxg8ocqvyr7jjhk205lfknnl',
				domain: '.tradingview.com',
			},
			{
				name: 'sessionid_sign',
				value: 'v3:0x18KSxoHi5nwUyFAvWWt+hAyMzuj5QXKFULA8bWB7s=',
				domain: '.tradingview.com',
			},
			{
				name: 'tv_ecuid',
				value: 'd637097c-674b-4b0e-a680-1f035be2d549',
				domain: '.tradingview.com',
			},
		]
		await page.setCookie(...cookies)

		console.log('✅ Авторизация через cookies успешна!')

		const [width, height] = [1920, 1080]
		await page.setViewport({ width, height })

		await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 0,
		})

		// 🔍 Ищем кнопку один раз и получаем её атрибут aria-pressed
		const objectTreeButtonData = await page.evaluate(() => {
			const xpath = "//button[@aria-label='Object Tree and Data Window']"
			const result = document.evaluate(
				xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			)
			const button = result.singleNodeValue

			if (button) {
				return {
					found: true,
					ariaPressed: button.getAttribute('aria-pressed'),
					xpath: xpath, // Сохраняем XPath, чтобы потом кликнуть
				}
			}
			return { found: false }
		})

		if (objectTreeButtonData.found) {
			console.log('✅ Кнопка "Object Tree and Data Window" найдена!')

			if (objectTreeButtonData.ariaPressed === 'false') {
				console.log('⚡ Кнопка не активна, кликаем...')

				// Кликаем по кнопке через XPath
				await page.evaluate(xpath => {
					const result = document.evaluate(
						xpath,
						document,
						null,
						XPathResult.FIRST_ORDERED_NODE_TYPE,
						null
					)
					const button = result.singleNodeValue
					if (button) button.click()
				}, objectTreeButtonData.xpath)

				console.log('✅ Кнопка активирована!')
			} else {
				console.log('✅ Кнопка уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Object Tree and Data Window" не найдена!')
		}

		// 🔍 Ищем кнопку "Data Window" один раз и получаем её атрибут aria-selected
		const dataWindowButtonData = await page.evaluate(() => {
			const xpath = "//button[@id='data-window']"
			const result = document.evaluate(
				xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			)
			const button = result.singleNodeValue

			if (button) {
				return {
					found: true,
					ariaSelected: button.getAttribute('aria-selected'),
					xpath: xpath, // Сохраняем XPath, чтобы потом кликнуть
				}
			}
			return { found: false }
		})

		if (dataWindowButtonData.found) {
			console.log('✅ Кнопка "Data Window" найдена!')

			if (dataWindowButtonData.ariaSelected === 'false') {
				console.log('⚡ Кнопка "Data Window" не активна, кликаем...')

				// Кликаем по кнопке через XPath
				await page.evaluate(xpath => {
					const result = document.evaluate(
						xpath,
						document,
						null,
						XPathResult.FIRST_ORDERED_NODE_TYPE,
						null
					)
					const button = result.singleNodeValue
					if (button) button.click()
				}, dataWindowButtonData.xpath)

				console.log('✅ Кнопка "Data Window" активирована!')
			} else {
				console.log('✅ Кнопка "Data Window" уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Data Window" не найдена!')
		}

		// 🔍 Ищем кнопку "TL 1.0" (span) один раз
		const tl1ButtonData = await page.evaluate(() => {
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

		if (tl1ButtonData.found) {
			console.log('✅ Спан с текстом "TL 1.0" найден!')
		} else {
			console.log('❌ Спан с текстом "TL 1.0" не найден!')

			// 🔍 Ищем кнопку "Indicators, metrics, and strategies"
			const indicatorButtonData = await page.evaluate(() => {
				const xpath =
					"//button[@aria-label='Indicators, metrics, and strategies']"
				const result = document.evaluate(
					xpath,
					document,
					null,
					XPathResult.FIRST_ORDERED_NODE_TYPE,
					null
				)
				const button = result.singleNodeValue
				return {
					found: button !== null,
					xpath: xpath,
				}
			})

			if (indicatorButtonData.found) {
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
					const button = result.singleNodeValue
					if (button) button.click()
				}, indicatorButtonData.xpath)

				console.log(
					'✅ Кнопка "Indicators, metrics, and strategies" активирована!'
				)

				// 🔍 Бесконечный цикл поиска "Invite-only"
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
						const spanElement = result.singleNodeValue

						if (spanElement) {
							const parentDiv = spanElement.closest('div')
							if (parentDiv) {
								parentDiv.click()
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
					const divElement = result.singleNodeValue

					if (divElement) {
						// Ищем span с текстом "Indicator - TL 1.0" через XPath
						const spanXpath = ".//span[text()='Indicator - TL 1.0']" // Используем локальный XPath относительно div
						const spanResult = document.evaluate(
							spanXpath,
							divElement,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const spanElement = spanResult.singleNodeValue

						// Проверяем, найден ли нужный span
						const isTextCorrect = spanElement !== null

						// Ищем ссылку <a> с href="/u/igoraa500/" через XPath
						const linkXpath = ".//a[@href='/u/igoraa500/']" // Используем локальный XPath относительно div
						const linkResult = document.evaluate(
							linkXpath,
							divElement,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const linkElement = linkResult.singleNodeValue

						const isLinkCorrect = linkElement !== null

						if (isTextCorrect && isLinkCorrect) {
							divElement.click() // Кликаем по div, если оба условия выполнены
							return { found: true }
						}
					}

					return { found: false }
				})

				if (indicatorData.found) {
					console.log('✅ Элемент "Indicator - TL 1.0" найден и кликнут!')

					// 🔍 Ищем кнопку закрытия
					const closeButtonData = await page.evaluate(() => {
						const xpath = "//button[@data-name='close']"
						const result = document.evaluate(
							xpath,
							document,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const button = result.singleNodeValue

						if (button) {
							button.click()
							return { found: true }
						}
						return { found: false }
					})

					if (closeButtonData.found) {
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

		return

		// Ожидаемые цвета по индексам
		const expectedColors = [
			'rgb(255, 82, 82)', // 1, 5
			'rgb(255, 152, 0)', // 2, 6
			'rgb(76, 175, 80)', // 3, 7
			'rgb(49, 27, 146)', // 4, 8
		]

		// Функция для получения значений всех span внутри родительских div с "Shapes"
		const getSpans = async () => {
			return await page.evaluate(expectedColors => {
				const xpath = "//div[contains(text(), 'Shapes')]"
				const result = document.evaluate(
					xpath,
					document,
					null,
					XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
					null
				)

				const spans = []

				for (let i = 0; i < result.snapshotLength && spans.length < 8; i++) {
					const shapesDiv = result.snapshotItem(i)
					if (!shapesDiv || !shapesDiv.parentElement) continue

					const span = shapesDiv.parentElement.querySelector('span')
					if (span) {
						const color = span.style.color
						const text = span.innerText.trim()
						const expectedColor = expectedColors[i % 4] // Цвет по шаблону
						const isValid = color === expectedColor // Проверка соответствия

						spans.push({ color, text, isValid })
					}
				}

				return spans
			}, expectedColors)
		}

		// Функция проверки соответствия цветов
		const validateColors = spans => {
			let isAllElementsValid = true

			spans.forEach((span, index) => {
				if (span.isValid) {
					console.log(
						`✅ Элемент ${index + 1} соответствует: ${span.color}, текст: "${
							span.text
						}"`
					)
				} else {
					isAllElementsValid = false

					console.error(
						`❌ Ошибка! Элемент ${index + 1}: ожидался цвет ${
							expectedColors[index % 4]
						}, но получен ${span.color}`
					)
				}
			})

			return isAllElementsValid
		}

		// 🔥 Первичная проверка цветов
		let previousSpans = await getSpans()
		console.log('📊 Начальные значения span:', previousSpans)
		const isValidColorOfElements = validateColors(previousSpans)

		if (isValidColorOfElements) {
			const tl = previousSpans.map(previousSpan => {
				const { isValid, ...newPreviousSpan } = previousSpan // Извлекаем все свойства, кроме isValid
				return newPreviousSpan
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
			} catch (error) {
				console.error('❌ Ошибка отправки данных:', error)
			}
		}

		// 🔄 Проверяем изменения каждые 20 мс
		setInterval(async () => {
			const currentSpans = await getSpans()

			// Проверяем изменения
			let hasChanges = false

			currentSpans.forEach((span, index) => {
				if (
					span.color !== previousSpans[index]?.color ||
					span.text !== previousSpans[index]?.text
				) {
					hasChanges = true
				}
			})

			// Если были изменения, проверяем цвета
			if (hasChanges) {
				console.log('tl изменился: ')
				console.log(currentSpans)
				const isValidColorOfElements = validateColors(currentSpans)
				previousSpans = currentSpans

				if (isValidColorOfElements) {
					const tl = previousSpans.map(previousSpan => {
						const { isValid, ...newPreviousSpan } = previousSpan // Извлекаем все свойства, кроме isValid
						return newPreviousSpan
					})

					const now = new Date()
					const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
						.toString()
						.padStart(2, '0')}-${now
						.getDate()
						.toString()
						.padStart(2, '0')} ${now
						.getHours()
						.toString()
						.padStart(2, '0')}:${now
						.getMinutes()
						.toString()
						.padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

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
					} catch (error) {
						console.error('❌ Ошибка отправки данных:', error)
					}
				}
			}
		}, 20)

		await delay(3000)
	}
})()
