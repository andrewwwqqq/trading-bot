const puppeteer = require('puppeteer')

;(async () => {
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

	await page.goto(
		'https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7',
		{
			waitUntil: 'networkidle2',
			timeout: 0,
		}
	)

	// 🔍 Поиск кнопки с aria-label="Object Tree and Data Window"
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

	if (buttonExists) {
		console.log('✅ Кнопка "Object Tree and Data Window" найдена!')

		// Проверяем атрибут aria-pressed
		const ariaPressed = await page.evaluate(() => {
			const button = document.querySelector(
				"button[aria-label='Object Tree and Data Window']"
			)
			return button ? button.getAttribute('aria-pressed') : null
		})

		if (ariaPressed === 'false') {
			console.log('⚡ Кнопка не активна, кликаем...')
			// Кликаем по кнопке
			await page.click("button[aria-label='Object Tree and Data Window']")
			// Ждем, чтобы значение aria-pressed стало true

			console.log(`ariaPressed after click ${ariaPressed}`)

			console.log('✅ Кнопка активирована!')
		} else {
			console.log('✅ Кнопка уже активирована!')
		}
	} else {
		console.error('❌ Кнопка "Object Tree and Data Window" не найдена!')
	}

	// Теперь добавляем проверку для кнопки с текстом "Data Window"
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

	if (dataWindowButtonExists) {
		console.log('✅ Кнопка "Data Window" найдена!')

		if (dataWindowButtonExists === 'false') {
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

			for (let i = 0; i < result.snapshotLength; i++) {
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
		spans.forEach((span, index) => {
			if (index >= 8) return // Проверяем только 1-8 элементы
			if (span.isValid) {
				console.log(
					`✅ Элемент ${index + 1} соответствует: ${span.color}, текст: "${
						span.text
					}"`
				)
			} else {
				console.error(
					`❌ Ошибка! Элемент ${index + 1}: ожидался цвет ${
						expectedColors[index % 4]
					}, но получен ${span.color}`
				)
			}
		})
	}

	// 🔥 Первичная проверка цветов
	let previousSpans = await getSpans()
	console.log('📊 Начальные значения span:', previousSpans)
	validateColors(previousSpans)

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
				console.log(
					`🔄 Изменение в элементе ${index + 1}: цвет ${span.color}, текст: "${
						span.text
					}"`
				)
			}
		})

		// Если были изменения, проверяем цвета
		if (hasChanges) {
			validateColors(currentSpans)
			previousSpans = currentSpans
		}
	}, 20)
})()

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// const browser = await puppeteer.launch({
// 	headless: false,
// 	args: ['--start-maximized'],
// })
// const page = await browser.newPage()

// // Устанавливаем cookies для авторизации
// const cookies = [
// 	{
// 		name: 'sessionid',
// 		value: 'eictbpvvxxg8ocqvyr7jjhk205lfknnl',
// 		domain: '.tradingview.com',
// 	},
// 	{
// 		name: 'sessionid_sign',
// 		value: 'v3:0x18KSxoHi5nwUyFAvWWt+hAyMzuj5QXKFULA8bWB7s=',
// 		domain: '.tradingview.com',
// 	},
// 	{
// 		name: 'tv_ecuid',
// 		value: 'd637097c-674b-4b0e-a680-1f035be2d549',
// 		domain: '.tradingview.com',
// 	},
// ]
// await page.setCookie(...cookies)

// console.log('✅ Авторизация через cookies успешна!')

// const [width, height] = [1920, 1080] // Устанавливаем разрешение экрана (например, FullHD)
// await page.setViewport({ width, height })

// // Открываем страницу TradingView
// await page.goto(
// 	'https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7',
// 	{
// 		waitUntil: 'domcontentloaded',
// 	}
// )

// // Ждём, пока прогрузится кнопка "Indicators"
// await page.waitForSelector(
// 	'button[aria-label="Indicators, metrics, and strategies"]',
// 	{ timeout: 10000 }
// )
// await page.click('button[aria-label="Indicators, metrics, and strategies"]')

// // Ждём вкладки и кликаем по последней (invite tab)
// await page.waitForSelector('.tab-nGEmjtaX', { timeout: 10000 })
// await delay(3000) // Заменяем setTimeout на задержку с Promise

// const tabs = await page.$$('.tab-nGEmjtaX')
// if (tabs.length > 0) {
// 	await tabs[tabs.length - 1].click()
// }

// // Ждем, пока появится ссылка
// await page.waitForSelector('div.container-WeNdU0sq a[href="/u/igoraa500/"]', {
// 	timeout: 10000,
// })

// // Получаем все div.container-WeNdU0sq
// const allContainers = await page.$$('div.container-WeNdU0sq')

// let targetIndex = -1

// // Ищем индекс нужного контейнера
// for (let i = 0; i < allContainers.length; i++) {
// 	const link = await allContainers[i].$('a[href="/u/igoraa500/"]')
// 	if (link) {
// 		targetIndex = i
// 		break // Нашли нужный div, выходим из цикла
// 	}
// }

// if (targetIndex !== -1) {
// 	// Кликаем по найденному контейнеру
// 	await allContainers[targetIndex].click()
// } else {
// 	console.log('Не найден div.container-WeNdU0sq с нужной ссылкой.')
// }

// // Ждём кнопку закрытия попапа и кликаем
// await page.waitForSelector('.nav-button-znwuaSC1', { timeout: 10000 })
// await page.click('.nav-button-znwuaSC1')

// try {
// 	// Сворачиваем overview
// 	await page.waitForSelector('button[aria-label="Collapse panel"]', {
// 		timeout: 5000,
// 	})
// 	await page.click('button[aria-label="Collapse panel"]')
// } catch (error) {
// 	console.log("Кнопка 'Collapse panel' не найдена, пропускаем...")
// }

// // Ждём кнопку
// await page.waitForSelector(
// 	'button[aria-label="Object Tree and Data Window"]',
// 	{
// 		timeout: 10000,
// 	}
// )

// // Находим кнопку
// const button = await page.$(
// 	'button[aria-label="Object Tree and Data Window"]'
// )

// if (button) {
// 	// Проверяем, есть ли у неё активный класс
// 	const hasActiveClass = await page.evaluate(
// 		el => el.classList.contains('isActive-I_wb5FjE'),
// 		button
// 	)

// 	if (!hasActiveClass) {
// 		await button.click() // Кликаем, только если класса нет
// 		console.log('✅ Кнопка нажата')
// 	} else {
// 		console.log('⚡ Кнопка уже активна, клик не нужен')
// 	}
// }

// // Кликаем по "Data Window"
// await page.waitForSelector('#data-window', { timeout: 10000 })
// await page.click('#data-window')

// // Ждем появления .values-_gbYDtbd
// await page.waitForSelector('.values-_gbYDtbd', { timeout: 10000 })

// let tlItemsValue = [] // Глобальный массив для отслеживания изменений

// async function checkTLValues() {
// 	const allValues = await page.$$('.values-_gbYDtbd')
// 	if (allValues.length < 3) return console.log('Элемент не найден.')

// 	const thirdValue = allValues[2] // 3-й элемент
// 	const tlItems = await thirdValue.$$('.item-_gbYDtbd')

// 	let newValues = []
// 	for (const item of tlItems) {
// 		const span = await item.$('span')
// 		if (span) {
// 			const text = await page.evaluate(el => el.textContent.trim(), span)
// 			newValues.push(text)
// 		}
// 	}

// 	// ⚡ Быстрая проверка изменений (без JSON.stringify)
// 	if (
// 		newValues.length !== tlItemsValue.length ||
// 		newValues.some((val, i) => val !== tlItemsValue[i])
// 	) {
// 		console.log('⚡ Данные TL обновились:', newValues)
// 		tlItemsValue = [...newValues] // Обновляем массив
// 	}

// 	setTimeout(checkTLValues, 20)
// }

// // Запускаем отслеживание
// checkTLValues()
