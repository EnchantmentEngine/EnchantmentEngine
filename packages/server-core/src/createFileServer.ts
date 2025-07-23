import packageRoot from 'app-root-path'
import fs from 'fs'
import https from 'https'
import net from 'net'
import { join } from 'path'
import serveStatic from 'serve-static'

import kill from 'kill-port'
import config from './appconfig'

const serve = process.env.TEST === 'true' ? serveStatic('../server/upload_test/') : serveStatic('../server/upload/')

let server: https.Server = null!
const options = {
  key: fs.readFileSync(join(packageRoot.path, process.env.KEY || 'certs/key.pem')),
  cert: fs.readFileSync(join(packageRoot.path, process.env.CERT || 'certs/cert.pem'))
}

const createTestFileServer = (port: number, isServerRunning: boolean) => {
  if (isServerRunning) return

  server = https.createServer(options, (req, res) => {
    serve(req, res, () => {})
  })
  server.listen(port)
}

export const StartTestFileServer = () => {
  const port = config.server.localStorageProviderPort
  isPortTaken(port, createTestFileServer)
}

const isPortTaken = (port, fn) => {
  const tester = net
    .createServer()
    .once('error', (err) => {
      tester.close()
      kill(port, 'tcp').then(() => {
        fn(port, false)
      })
    })
    .once('listening', () => {
      tester
        .once('close', () => {
          fn(port, false)
        })
        .close()
    })
    .listen(port)
}
