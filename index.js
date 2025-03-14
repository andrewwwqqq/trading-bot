const puppeteer = require('puppeteer')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

	const [width, height] = [1920, 1080] // Устанавливаем разрешение экрана (например, FullHD)
	await page.setViewport({ width, height })

	// Открываем страницу TradingView
	await page.goto(
		'https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7',
		{
			waitUntil: 'networkidle2',
		}
	)

	// Ждём, пока прогрузится кнопка "Indicators"
	await page.waitForSelector(
		'button[aria-label="Indicators, metrics, and strategies"]',
		{ timeout: 10000 }
	)
	await page.click('button[aria-label="Indicators, metrics, and strategies"]')

	// Ждём вкладки и кликаем по последней (invite tab)
	await page.waitForSelector('.tab-nGEmjtaX', { timeout: 10000 })
	await delay(3000) // Заменяем setTimeout на задержку с Promise

	const tabs = await page.$$('.tab-nGEmjtaX')
	if (tabs.length > 0) {
		await tabs[tabs.length - 1].click()
	}

	// Ждем, пока появится ссылка
	await page.waitForSelector('div.container-WeNdU0sq a[href="/u/igoraa500/"]', {
		timeout: 10000,
	})

	// Получаем все div.container-WeNdU0sq
	const allContainers = await page.$$('div.container-WeNdU0sq')

	let targetIndex = -1

	// Ищем индекс нужного контейнера
	for (let i = 0; i < allContainers.length; i++) {
		const link = await allContainers[i].$('a[href="/u/igoraa500/"]')
		if (link) {
			targetIndex = i
			break // Нашли нужный div, выходим из цикла
		}
	}

	if (targetIndex !== -1) {
		// Кликаем по найденному контейнеру
		await allContainers[targetIndex].click()
	} else {
		console.log('Не найден div.container-WeNdU0sq с нужной ссылкой.')
	}

	// Ждём кнопку закрытия попапа и кликаем
	await page.waitForSelector('.nav-button-znwuaSC1', { timeout: 10000 })
	await page.click('.nav-button-znwuaSC1')

	try {
		// Сворачиваем overview
		await page.waitForSelector('button[aria-label="Collapse panel"]', {
			timeout: 5000,
		})
		await page.click('button[aria-label="Collapse panel"]')
	} catch (error) {
		console.log("Кнопка 'Collapse panel' не найдена, пропускаем...")
	}

	// Открываем окно данных
	await page.waitForSelector(
		'button[aria-label="Object Tree and Data Window"]',
		{ timeout: 10000 }
	)
	await page.click('button[aria-label="Object Tree and Data Window"]')

	// Кликаем по "Data Window"
	await page.waitForSelector('#data-window', { timeout: 10000 })
	await page.click('#data-window')

	// Ждем появления .values-_gbYDtbd
	await page.waitForSelector('.values-_gbYDtbd', { timeout: 10000 })

	let tlItemsValue = [] // Глобальный массив для отслеживания изменений

	async function checkTLValues() {
		const allValues = await page.$$('.values-_gbYDtbd')
		if (allValues.length < 3) return console.log('Элемент не найден.')

		const thirdValue = allValues[2] // 3-й элемент
		const tlItems = await thirdValue.$$('.item-_gbYDtbd')

		let newValues = []
		for (const item of tlItems) {
			const span = await item.$('span')
			if (span) {
				const text = await page.evaluate(el => el.textContent.trim(), span)
				newValues.push(text)
			}
		}

		// ⚡ Быстрая проверка изменений (без JSON.stringify)
		if (
			newValues.length !== tlItemsValue.length ||
			newValues.some((val, i) => val !== tlItemsValue[i])
		) {
			console.log('⚡ Данные TL обновились:', newValues)
			tlItemsValue = [...newValues] // Обновляем массив
		}

		setTimeout(checkTLValues, 5000) // Проверяем каждые 5 сек
	}

	// Запускаем отслеживание
	checkTLValues()
})()
