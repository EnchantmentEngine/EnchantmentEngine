import dotenv from 'dotenv'
// dotenv.config({ path: '.env.local' })
console.log(process.env)
console.log(dotenv.parse('.env.local'))
// @ts-ignore
globalThis.process = { env: dotenv.parse('.env.local') }
