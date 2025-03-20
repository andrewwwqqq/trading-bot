const urls = [
	'https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT&interval=7',
	'https://www.tradingview.com/chart/?symbol=BINANCE:ADAUSDT&interval=7',
]

const currencies = ['AVAXUSDT', 'ADAUSDT']
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

module.exports = { urls, currencies, cookies }
