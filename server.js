const express = require('express')
const { Client } = require('pg')
const app = express()
const PORT = 3000

// Подключение к базе данных PostgreSQL
const client = new Client({
	user: 'postgres', // Имя пользователя
	host: 'localhost', // Хост
	database: 'currencies', // База данных
	password: '123456', // Пароль (если есть)
	port: 5432, // Порт (по умолчанию 5432)
})

client
	.connect()
	.then(() => console.log('✅ Подключено к PostgreSQL'))
	.catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err))

// Проверка наличия таблицы и её создание, если она не существует
async function ensureTableExists() {
	try {
		// Проверяем существование таблицы "data"
		const result = await client.query("SELECT to_regclass('public.data')")

		if (result.rows[0].to_regclass === null) {
			// Если таблица не существует, создаем её
			const createTableQuery = `
        CREATE TABLE data (
          currencie VARCHAR(50) PRIMARY KEY,
          tl JSONB,
          timestamp VARCHAR(255)
        );
      `
			await client.query(createTableQuery)
			console.log('✅ Таблица "data" была создана.')
		}

		// Проверяем наличие нужных колонок и добавляем их при необходимости
		const columnsResult = await client.query(
			"SELECT column_name FROM information_schema.columns WHERE table_name = 'data'"
		)

		const columns = columnsResult.rows.map(row => row.column_name)

		// Если какой-то из столбцов отсутствует, добавляем его
		if (!columns.includes('currencie')) {
			await client.query(
				'ALTER TABLE data ADD COLUMN currencie VARCHAR(50) PRIMARY KEY'
			)
		}
		if (!columns.includes('tl')) {
			await client.query('ALTER TABLE data ADD COLUMN tl JSONB')
		}
		if (!columns.includes('timestamp')) {
			await client.query('ALTER TABLE data ADD COLUMN timestamp VARCHAR(255)')
		}

		console.log('✅ Колонки проверены/созданы.')
	} catch (error) {
		console.error('❌ Ошибка при проверке или создании таблицы:', error)
	}
}

// Вызов функции при старте сервера
ensureTableExists()

// Используем body-parser для парсинга JSON
app.use(express.json())

// 📌 POST-запрос для сохранения данных в PostgreSQL
app.post('/data', async (req, res) => {
	try {
		const { currencie, tl, timestamp } = req.body

		if (!currencie || !tl || !timestamp) {
			return res.status(400).json({ error: 'Некорректные данные' })
		}

		// Запрос на вставку данных в таблицу без ON CONFLICT
		const query =
			'INSERT INTO data(currencie, tl, timestamp) VALUES($1, $2, $3);'
		const values = [currencie, JSON.stringify(tl), timestamp]

		await client.query(query, values)

		console.log(`✅ Данные сохранены в PostgreSQL: ${currencie}`)
		res.json({ message: 'Данные успешно сохранены' })
	} catch (error) {
		console.error('❌ Ошибка сервера:', error)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
})

// 📌 GET-запрос для получения данных из PostgreSQL
app.get('/data/:currencie', async (req, res) => {
	try {
		const { currencie } = req.params

		const result = await client.query(
			'SELECT * FROM data WHERE currencie = $1',
			[currencie]
		)

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Данные не найдены' })
		}

		res.json(result.rows[0]) // Отправляем данные как JSON
	} catch (error) {
		console.error('❌ Ошибка сервера:', error)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
})

// 📌 Запуск сервера
app.listen(PORT, () => {
	console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
})
