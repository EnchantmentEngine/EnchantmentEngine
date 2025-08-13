import { koa } from '@feathersjs/koa'
import packageRoot from 'app-root-path'
import fs from 'fs'
import http from 'http'
import https from 'https'
import favicon from 'koa-favicon'
import sendFile from 'koa-send'
import serve from 'koa-static'
import { join } from 'path'
import psList from 'ps-list'

import config from '@ir-engine/server-core/src/appconfig'
import { createFeathersKoaApp } from '@ir-engine/server-core/src/createApp'
import { StartCorsServer } from '@ir-engine/server-core/src/createCorsServer'
import multiLogger from '@ir-engine/server-core/src/ServerLogger'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'

import channels from './channels'

const logger = multiLogger.child({ component: 'server-core:user' })

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

export const start = async (): Promise<void> => {
  const app = await createFeathersKoaApp(ServerMode.API)

  app.use(favicon(join(config.server.publicDir, 'favicon.ico')))
  app.configure(channels)

  const key = process.platform === 'win32' ? 'name' : 'cmd'
  if (!config.kubernetes.enabled) {
    const processList = await (
      await psList()
    ).filter((e) => {
      const regexp = /docker-compose up|docker-proxy|mysql|postgres/gi
      return e[key]?.match(regexp)
    })
    const dockerProcess = processList.find((c) => c[key]?.match(/docker-compose/))
    const dockerProxy = processList.find((c) => c[key]?.match(/docker-proxy/))
    const processMysql = processList.find((c) => c[key]?.match(/mysql/))
    const processPostgres = processList.find((c) => c[key]?.match(/postgres/))
    const databaseService = (dockerProcess && dockerProxy) || processMysql || processPostgres

    if (!databaseService) {
      // Check for child process with mac OSX
      // exec("docker ps | grep mariadb", (err, stdout, stderr) => {
      //   if(!stdout.includes("mariadb")){
      //     throw new Error('\x1b[33mError: DB process is not running or Docker is not running!. If you are in local development, please run ir-engine/scripts/start-containers.sh and restart server\x1b[0m');
      //   }
      // });
    }
  }

  // SSL setup
  const certPath = config.server.certPath
  const certKeyPath = config.server.keyPath

  const useSSL = !config.noSSL && (config.localBuild || !config.kubernetes.enabled) && fs.existsSync(certKeyPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  }

  if (useSSL) {
    logger.info('Starting server with HTTPS')
  } else {
    logger.info("Starting server with NO HTTPS, if you meant to use HTTPS try 'sudo bash generate-certs'")
  }
  const port = Number(config.server.port)

  // http redirects for development
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

  const server = useSSL ? https.createServer(certOptions as any, app.callback()).listen(port) : await app.listen(port)

  if (useSSL) {
    app.setup(server)
  }

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })
  server.on('listening', () =>
    logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
  )

  if (!config.kubernetes.enabled) {
    StartCorsServer(useSSL, certOptions)
  }

  if (
    process.env.SERVE_CLIENT_FROM_API &&
    !process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER &&
    process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER !== 'true'
  ) {
    const clientApp = koa()
    clientApp.use(
      serve(join(packageRoot.path, 'packages', 'client', 'dist'), {
        brotli: true,
        setHeaders: (ctx) => {
          ctx.setHeader('Origin-Agent-Cluster', '?1')
        }
      })
    )
    clientApp.use(async (ctx) => {
      await sendFile(ctx, join('dist', 'index.html'), {
        root: join(packageRoot.path, 'packages', 'client')
      })
    })
    clientApp.listen = function () {
      let server
      const HTTPS = process.env.VITE_LOCAL_BUILD ?? false
      if (HTTPS) {
        server = https.createServer(certOptions as any, this.callback())
      } else {
        server = http.createServer(this.callback())
      }
      // eslint-disable-next-line prefer-spread, prefer-rest-params
      return server.listen.apply(server, arguments)
    }

    const PORT = parseInt(config.client.port) || 3000
    clientApp.listen(PORT, () => console.log(`Client listening on port: ${PORT}`))
  }
}
