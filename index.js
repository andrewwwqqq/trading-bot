const puppeteer = require('puppeteer')
const { cookies, urls, currencies } = require('./constants')
const { delay, sendTlData } = require('./share')
const { sendMessageToGroup } = require('./telegram-bot')
const {
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
		await sendMessageToGroup(
			`${currencies[index]} :✅ Авторизация через cookies успешна!`
		)

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
			await sendMessageToGroup(
				`${currencies[index]} :✅ Кнопка "Object Tree and Data Window" найдена!`
			)

			// проверяем активна ли Object Tree and Data Window
			if (objectTreeButtonData.ariaPressed === 'false') {
				console.log(
					'⚡ Кнопка  "Object Tree and Data Window" не активна, кликаем...'
				)
				await sendMessageToGroup(
					`${currencies[index]} :⚡ Кнопка  "Object Tree and Data Window" не активна, кликаем...`
				)

				// Кликаем по кнопке через XPath
				await doObjectTreeButtonActive(page, objectTreeButtonData)
				console.log('✅ Кнопка  "Object Tree and Data Window" активирована!')

				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка  "Object Tree and Data Window" активирована!`
				)
			} else {
				console.log(
					'✅ Кнопка  "Object Tree and Data Window" уже активирована!'
				)
				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка  "Object Tree and Data Window" уже активирована!`
				)
			}
		} else {
			console.error('❌ Кнопка "Object Tree and Data Window" не найдена!')
			await sendMessageToGroup(
				`${currencies[index]} : ❌ Кнопка "Object Tree and Data Window" не найдена!`
			)
		}
		// 🔍 Ищем кнопку "Data Window" один раз и получаем её атрибут aria-selected
		const dataWindowButtonData = await findDataWindowButtonData(page)

		// если кнопка Data Window найдена
		if (dataWindowButtonData.found) {
			console.log('✅ Кнопка "Data Window" найдена!')
			await sendMessageToGroup(
				`${currencies[index]} :✅ Кнопка "Data Window" найдена!`
			)
			// проверяем активна ли кнопка Data Window
			if (dataWindowButtonData.ariaSelected === 'false') {
				console.log('⚡ Кнопка "Data Window" не активна, кликаем...')
				await sendMessageToGroup(
					`${currencies[index]} :⚡ Кнопка "Data Window" не активна, кликаем...`
				)
				// Кликаем по кнопке через XPath
				await doDataWindowButtonActive(page, dataWindowButtonData)
				console.log('✅ Кнопка "Data Window" активирована!')
				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка "Data Window" активирована!`
				)
			} else {
				console.log('✅ Кнопка "Data Window" уже активирована!')
				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка "Data Window" уже активирована!`
				)
			}
		} else {
			console.error('❌ Кнопка "Data Window" не найдена!')
			await sendMessageToGroup(
				`${currencies[index]} : ❌ Кнопка "Data Window" не найдена!`
			)
		}

		// 🔍 ищем индикатор "TL 1.0" на панели
		const tl1Indicator = await findTl1Indicator(page)

		// есть ли индикатор "TL 1.0" на панели
		if (tl1Indicator.found) {
			console.log('✅ Индикатор "TL 1.0" на панели есть')

			await sendMessageToGroup(
				`${currencies[index]} :✅ Индикатор "TL 1.0" на панели есть`
			)
		} else {
			console.log('❌ Индикатор "TL 1.0" на панели нету!')
			await sendMessageToGroup(
				`${currencies[index]} :❌ Индикатор "TL 1.0" на панели нету`
			)
			// 🔍 Ищем кнопку для выбора индикаторов
			const chooseIndicatorButtonData = await findChooseIndicatorButtonData(
				page
			)

			// если нашли кнопку для выбора индикаторов
			if (chooseIndicatorButtonData.found) {
				console.log('✅ Кнопка "Indicators, metrics, and strategies" найдена!')
				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка "Indicators, metrics, and strategies" найдена!`
				)
				// Кликаем по кнопке через XPath
				await doChooseIndicatorButtonActive(page, chooseIndicatorButtonData)

				console.log(
					'✅ Кнопка "Indicators, metrics, and strategies" активирована!'
				)
				await sendMessageToGroup(
					`${currencies[index]} :✅ Кнопка "Indicators, metrics, and strategies" активирована!`
				)
				// 🔍 Бесконечный цикл поиска вкладки "Invite-only"
				while (true) {
					console.log('⏳ Ищем таб "Invite-only"...')
					await sendMessageToGroup(
						`${currencies[index]} :⏳ Ищем таб "Invite-only"...`
					)

					const inviteOnlyData = await findInviteOnlyData(page)

					if (inviteOnlyData.found) {
						console.log('✅ Таб "Invite-only" найден и кликнут!')
						await sendMessageToGroup(
							`${currencies[index]} :✅ Таб "Invite-only" найден и кликнут!`
						)

						break
					}

					console.log(
						'❌ Элемент "Invite-only" не найден, повторяем через 2 секунды...'
					)
					await sendMessageToGroup(
						`${currencies[index]} :❌ Элемент "Invite-only" не найден, повторяем через 2 секунды...`
					)
					await delay(2000)
				}

				// 🔍 Проверяем и кликаем по "Indicator - TL 1.0"
				const indicatorData = await findIndicatorData(page)

				if (indicatorData.found) {
					console.log('✅ Элемент "Indicator - TL 1.0" найден и кликнут!')
					await sendMessageToGroup(
						`${currencies[index]} :✅ Элемент "Indicator - TL 1.0" найден и кликнут!`
					)
					// 🔍 Ищем кнопку закрытия выбора индикаторов
					const closeIndicatorsButtonData = await findCloseIndicatorsButtonData(
						page
					)

					if (closeIndicatorsButtonData.found) {
						console.log('✅ Кнопка "Close indicators" найдена.')
						await sendMessageToGroup(
							`${currencies[index]} :✅ Кнопка "Close indicators" найдена.`
						)

						await clickCloseIndicatorsButton(
							page,
							closeIndicatorsButtonData,
							index
						)
					} else {
						console.log('❌ Кнопка "Close" не найдена.')
						await sendMessageToGroup(
							`${currencies[index]} :❌ Кнопка "Close" не найдена.`
						)
					}
				} else {
					console.log('❌ Элемент "Indicator - TL 1.0" не найден.')
					await sendMessageToGroup(
						`${currencies[index]} :❌ Элемент "Indicator - TL 1.0" не найден.`
					)
				}
			} else {
				console.error(
					'❌ Кнопка "Indicators, metrics, and strategies" не найдена!'
				)
				await sendMessageToGroup(
					`${currencies[index]} :❌ Кнопка "Indicators, metrics, and strategies" не найдена!`
				)
			}
		}

		// 🔥 Первичная проверка цветов и значений tl
		let previousShapesData = await getShapesData(page)
		console.log('📊 Начальные значения tl:', previousShapesData)
		await sendMessageToGroup(
			`${currencies[index]} :📊 Начальные значения tl установлены`
		)
		const isValidColorOfElements = validateColors(previousShapesData)

		if (isValidColorOfElements) {
			await sendTlData(previousShapesData, index)
		} else {
			console.log('❌ Что-то не так со структурой tl, либо цвета изменились')
			await sendMessageToGroup(
				`${currencies[index]} :❌ Что-то не так со структурой tl, либо цвета изменились`
			)
		}

		// 🔄 Проверяем изменения каждые n мс
		setInterval(async () => {
			const currentShapesData = await getShapesData(page)

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
				await sendMessageToGroup(`${currencies[index]} :📊 tl изменился`)
				console.log(currentShapesData)

				const isValidColorOfElements = validateColors(currentShapesData)
				previousShapesData = currentShapesData

				if (isValidColorOfElements) {
					await sendTlData(previousShapesData, index)
				} else {
					console.log(
						'❌ Что-то не так со структурой tl, либо цвета изменились'
					)

					await sendMessageToGroup(
						`${currencies[index]} :❌ Что-то не так со структурой tl, либо цвета изменились`
					)
				}
			}
		}, 20)

		await delay(3000)
	}
})()
