import { Application, feathers } from '@feathersjs/feathers'
import { koa } from '@feathersjs/koa'
import { ServiceTypes } from '@ir-engine/common/declarations'
import primus from '@ir-engine/server-core/src/util/primus' // todo pull out server import inside primus
import fs from 'fs'
import https from 'https'
import healthcheck from 'koa-simple-healthcheck'
import path from 'path'

const cwd = process.cwd()

// Types for `app.set(name, value)` and `app.get(name)`
export type Configuration = {
  clientHost: string
  clientPort: number | null
  serverHost: string
  serverPort: number
  certPath: string | null
  keyPath: string | null
}

export const createApp = (services: (app: Application) => void, config: Configuration) => {
  const app = koa(feathers<ServiceTypes, Configuration>())

  const origin = config.clientPort
    ? 'https://' + config.clientHost + ':' + config.clientPort
    : 'https://' + config.clientHost

  app.use(healthcheck())

  // primus
  app.configure(
    primus(
      {
        transformer: 'websockets',
        origins: origin,
        methods: ['OPTIONS', 'GET', 'POST'],
        pingInterval: 10000,
        pingTimeout: 30000,
        headers: '*',
        credentials: false
      },
      (primus) => {
        primus.use((message, socket, next) => {
          message.feathers.socketQuery = message.query
          message.socketQuery = message.query
          message.feathers.forwarded = message.forwarded
          next()
        })
      }
    )
  )

  app.configure(services)

  const certKeyPath = config.keyPath ? path.resolve(cwd, config.keyPath) : null
  const certPath = config.certPath ? path.resolve(cwd, config.certPath) : null

  const useSSL = certKeyPath && certPath && fs.existsSync(certKeyPath) && fs.existsSync(certPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  }

  if (useSSL) {
    console.info('Starting server with HTTPS')
  } else {
    console.info("Starting server with NO HTTPS, if you meant to use HTTPS try 'sudo bash generate-certs'")
  }

  if (useSSL) {
    app.use(async (ctx, next) => {
      if (ctx.secure) {
        // request was via https, so do no special handling
        await next()
      } else {
        // request was via http, so redirect to https
        ctx.redirect('https://' + ctx.headers.host + ctx.url)
      }
    })
  }

  const server = useSSL
    ? https.createServer(certOptions as any, app.callback()).listen(config.serverPort)
    : app.listen(config.serverPort)

  if (useSSL) {
    app.setup(server)
  }

  return app
}
