const puppeteer = require('puppeteer')
const { delay } = require('./helpers')
const { urls, currencies, cookies, API_URL } = require('./constants')
const {
	checkIsObjectTreeButton,
	checkIsObjectTreeButtonActive,
	checkIsDataWindowButton,
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

		// 🔍 Поиск кнопки с aria-label="Object Tree and Data Window"
		const isObjectTreeButton = await checkIsObjectTreeButton(page)

		if (isObjectTreeButton) {
			console.log('✅ Кнопка "Object Tree and Data Window" найдена!')

			// Проверяем атрибут aria-pressed
			const isObjectTreeButtonActive = await checkIsObjectTreeButtonActive(page)

			if (isObjectTreeButtonActive === 'false') {
				console.log('⚡ Кнопка не активна, кликаем...')
				// Кликаем по кнопке
				await page.click("button[aria-label='Object Tree and Data Window']")
				// Ждем, чтобы значение aria-pressed стало true

				console.log('✅ Кнопка активирована!')
			} else {
				console.log('✅ Кнопка уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Object Tree and Data Window" не найдена!')
		}

		// Теперь добавляем проверку для кнопки с текстом "Data Window"
		const isDataWindowButton = await checkIsDataWindowButton(page)

		if (isDataWindowButton) {
			console.log('✅ Кнопка "Data Window" найдена!')

			if (isDataWindowButton === 'false') {
				console.log('⚡ Кнопка "Data Window" не активна, кликаем...')
				// Кликаем по кнопке
				await page.evaluate(() => {
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
							button.click() // Кликаем по кнопке
						}
					}
				})
				console.log('✅ Кнопка "Data Window" активирована!')
			} else {
				console.log('✅ Кнопка "Data Window" уже активирована!')
			}
		} else {
			console.error('❌ Кнопка "Data Window" не найдена!')
		}

		const tl1ButtonExists = await page.evaluate(() => {
			const xpath = "//span[contains(text(), 'TL 1.0')]" // Ищем span с нужным текстом
			const result = document.evaluate(
				xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			)
			const spanElement = result.singleNodeValue
			return spanElement !== null // Возвращаем true, если span найден
		})

		if (tl1ButtonExists) {
			console.log('✅ Спан с текстом "TL 1.0" найден!')
		} else {
			console.log('❌ Спан с текстом "TL 1.0" не найден!')

			// Ищем кнопку по aria-label и кликаем по ней
			const indicatorButtonExists = await page.evaluate(() => {
				const xpath =
					"//button[@aria-label='Indicators, metrics, and strategies']" // Ищем кнопку по aria-label
				const result = document.evaluate(
					xpath,
					document,
					null,
					XPathResult.FIRST_ORDERED_NODE_TYPE,
					null
				)
				const button = result.singleNodeValue
				return button !== null // Если кнопка найдена, возвращаем true
			})

			if (indicatorButtonExists) {
				console.log('✅ Кнопка "Indicators, metrics, and strategies" найдена!')

				// Кликаем по кнопке
				await page.evaluate(() => {
					const button = document.querySelector(
						"button[aria-label='Indicators, metrics, and strategies']"
					)
					if (button) {
						button.click() // Кликаем по кнопке
					}
				})

				console.log(
					'✅ Кнопка "Indicators, metrics, and strategies" активирована!'
				)

				while (true) {
					console.log('while start')
					// Создаем бесконечный цикл, который будет искать элемент, пока не найдет
					const inviteOnlyElementExists = await page.evaluate(() => {
						const xpath = "//span[contains(text(), 'Invite-only')]" // Ищем span с нужным текстом
						const result = document.evaluate(
							xpath,
							document,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const spanElement = result.singleNodeValue
						if (spanElement) {
							const parentDiv = spanElement.closest('div') // Находим родительский <div>
							if (parentDiv) {
								parentDiv.click() // Кликаем по родительскому <div>
								console.log('parent div')
								console.log(parentDiv)
								return true // Успешно кликнули
							} else {
								console.log(
									'Не нашли родительский элемент у span с текстом "Invite-only"'
								)
							}
						} else {
							console.log('Не нашли элемент с текстом "Invite-only"')
						}
						return false // Если не нашли элемент, возвращаем false
					})

					if (inviteOnlyElementExists) {
						console.log('✅ Элемент с текстом "Invite-only" найден и кликнут!')
						break // Выходим из цикла, если элемент найден
					}

					console.log(
						'❌ Элемент "Invite-only" не найден, перезапускаем через 2 секунды...'
					)
					await delay(2000)
				}

				const checkAndClickIndicator = async page => {
					const indicatorExists = await page.evaluate(() => {
						const xpath = "//div[@data-title='Indicator - TL 1.0']" // Ищем div с нужным data-title
						const result = document.evaluate(
							xpath,
							document,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const divElement = result.singleNodeValue // Получаем найденный div

						if (divElement) {
							// Проверяем, что внутри div есть span с текстом "Indicator - TL 1.0"
							const spanText = divElement.querySelector('span.title-cIIj4HrJ')
							const isTextCorrect =
								spanText && spanText.textContent === 'Indicator - TL 1.0'

							// Проверяем, что внутри div есть <a> с href="/u/igoraa500/"
							const link = divElement.querySelector('a[href="/u/igoraa500/"]')
							const isLinkCorrect = link !== null

							if (isTextCorrect && isLinkCorrect) {
								console.log('✅ Элемент с нужными данными найден!')

								// Кликаем по div
								divElement.click()
								console.log('✅ Клик по элементу выполнен!')

								return true // Если все условия выполнены, возвращаем true
							} else {
								console.log('❌ Условия не выполнены:')
								if (!isTextCorrect) console.log('  - Нет нужного текста в span')
								if (!isLinkCorrect) console.log('  - Нет нужной ссылки в <a>')
							}
						} else {
							console.log(
								'❌ Элемент с data-title="Indicator - TL 1.0" не найден!'
							)
						}

						return false // Если элемент не найден или условия не выполнены, возвращаем false
					})

					return indicatorExists
				}

				// Использование функции
				const indicatorFound = await checkAndClickIndicator(page)
				if (indicatorFound) {
					// Далее, если элемент найден и условия выполнены, можно продолжить с ним работу
					console.log('Элемент найден, клик выполнен, продолжаем...')

					const closeButtonExists = await page.evaluate(() => {
						const xpath = "//button[@data-name='close']" // Ищем кнопку по атрибуту data-name="close"
						const result = document.evaluate(
							xpath,
							document,
							null,
							XPathResult.FIRST_ORDERED_NODE_TYPE,
							null
						)
						const button = result.singleNodeValue

						if (button) {
							console.log('✅ Кнопка "Close" найдена!')
							button.click() // Кликаем по кнопке
							console.log('✅ Клик по кнопке "Close" выполнен!')
							return true
						} else {
							console.log('❌ Кнопка "Close" не найдена!')
							return false
						}
					})

					// Использование функции
					if (closeButtonExists) {
						console.log('Кнопка "Close" была нажата.')
					} else {
						console.log('Кнопка "Close" не найдена.')
					}
				} else {
					console.log('Элемент не найден или не удовлетворяет условиям.')
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
