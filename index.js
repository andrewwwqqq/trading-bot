// https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7

// indicators button
const showIndicatorsButton = document.querySelector(
	'button[aria-label="Indicators, metrics, and strategies"]'
)
showIndicatorsButton.click()

// invite tab
const tabs = document.querySelectorAll('.tab-nGEmjtaX')
const tabsLength = tabs.length
const inviteTab = tabs[tabsLength - 1]
inviteTab.click()

// indicator tl igoraa
const indicatorTlButton = document
	.querySelector('div.container-WeNdU0sq a[href="/u/igoraa500/"]')
	?.closest('div.container-WeNdU0sq')
indicatorTlButton.click()

// close indicator popup button
const closeIndicatorPopup = document.querySelector('.nav-button-znwuaSC1')
closeIndicatorPopup.click()

// hide overview of tl
const collapseButton = document.querySelector(
	'button[aria-label="Collapse panel"]'
)
collapseButton.click()

// open data window button
const openDataWindowButton = document.querySelector(
	'button[aria-label="Object Tree and Data Window"]'
)
openDataWindowButton.click()

// data window button
const dataWindowButton = document.querySelector('#data-window')
dataWindowButton.click()

// tl items values
const tlItems = document
	.querySelectorAll('.values-_gbYDtbd')[2]
	.querySelectorAll('div.item-_gbYDtbd') // Находим все div
const tlItemsValue = Array.from(tlItems)
	.map(item => {
		const span = item.querySelector('span') // Ищем span внутри div
		return span ? span.textContent.trim() : null // Берём текст, если span найден
	})
	.filter(text => text !== null) // Фильтруем, убираем null

console.log(tlItemsValue)
