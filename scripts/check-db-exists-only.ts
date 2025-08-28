import cli from 'cli'
import knex from 'knex'

cli.enable('status')

const knexClient = knex({
  client: 'mysql',
  connection: {
    user: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE ?? 'ir-engine',
    charset: 'utf8mb4'
  }
})

cli.main(async () => {
  const [results] = await knexClient.raw("SHOW TABLES LIKE 'user';")

  if (results.length === 0) {
    console.log('database not found')
  } else {
    console.log('database found')
  }

  process.exit(0)
})
