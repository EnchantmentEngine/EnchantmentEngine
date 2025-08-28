// This must always be imported first
import './patchEngineNode'

/**
 * A server-side only multi-stream logger.
 * For isomorphic or client-side logging, use packages/common/src/logger.ts
 * (which will send all log events to this server-side logger here, via an
 *  API endpoint).
 */
import appRootPath from 'app-root-path'
import dotenv from 'dotenv-flow'
import os from 'os'
import path from 'path'
import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import pinoOpensearch from 'pino-opensearch'
import pretty from 'pino-pretty'

const kubernetesEnabled = process.env.KUBERNETES === 'true'

if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    node_env: 'local'
  })
}

const node = process.env.ELASTIC_HOST || 'http://localhost:9200'
const nodeOpensearch = process.env.OPENSEARCH_HOST || 'http://localhost:9200'
const useLogger = process.env.DISABLE_SERVER_LOG !== 'true'

const logStashAddress = process.env.LOGSTASH_ADDRESS || 'logstash-service'
const logStashPort = process.env.LOGSTASH_PORT || 5044

const streamToPretty = pretty({
  colorize: true
})

const defaultStreams = [streamToPretty]

// Enable log to logstash
if (process.env.LOG_TO_LOGSTASH === 'true') {
  /**
   * https://getpino.io/#/docs/transports?id=logstash
   * https://www.npmjs.com/package/pino-socket
   */
  const streamToLogstash = pino.transport({
    target: 'pino-socket',
    options: {
      address: logStashAddress,
      port: logStashPort,
      mode: 'tcp'
    }
  })
  defaultStreams.unshift(streamToLogstash)
}

// Enable log to local file
if (process.env.LOG_TO_FILE === 'true') {
  const streamToFile = pino.transport({
    target: 'pino/file',
    options: {
      mkdir: true,
      destination: path.join(appRootPath.path, 'logs/irengine.log')
    }
  })
  defaultStreams.unshift(streamToFile)
}

// Enable log to OpenSearch
if (process.env.LOG_TO_OPENSEARCH === 'true') {
  const streamToOpenSearch = pinoOpensearch({
    index: 'ir-engine',
    consistency: 'one',
    node: nodeOpensearch,
    auth: {
      username: process.env.OPENSEARCH_USER || 'admin',
      password: process.env.OPENSEARCH_PASSWORD || 'admin'
    },
    'es-version': 7,
    'flush-bytes': 1000
  })
  defaultStreams.unshift(streamToOpenSearch)
}

// Enable log to Elastic
if (process.env.LOG_TO_ELASTIC === 'true') {
  const streamToElastic = pinoElastic({
    index: 'ir-engine',
    node: node,
    esVersion: 7,
    flushBytes: 1000
  })
  defaultStreams.unshift(streamToElastic)
}

const multiStream = pino.multistream(defaultStreams)

export const logger = pino(
  {
    level: 'debug',
    enabled: useLogger,
    base: {
      hostname: os.hostname
    },
    hooks: {
      logMethod(inputArgs, method, level) {
        const pushOrUnshift = (pairs: { [key: string]: string }) => {
          if (inputArgs.length > 0 && typeof inputArgs[0] === 'string') {
            inputArgs.unshift(pairs)
          } else if (inputArgs.length > 0 && typeof inputArgs[0] !== 'string') {
            for (const key in pairs) {
              if (!(inputArgs[0] as any)[key]) {
                ;(inputArgs[0] as any)[key] = pairs[key]
              }
            }
          }
        }

        const defaultPairs = {
          component: 'server-core'
        }
        const defaultProperties = Object.keys(defaultPairs)

        const bindingPairs = this.bindings()
        const bindingProperties = Object.keys(bindingPairs)
        const bindingHasDefaultProps = bindingProperties.some(
          (item) => defaultProperties.includes(item) && bindingPairs[item]
        )

        const inputPairs = inputArgs.length > 0 && typeof inputArgs[0] !== 'string' ? inputArgs[0] : {}
        const inputProperties = Object.keys(inputPairs)
        const inputHasDefaultProps = inputProperties.some(
          (item) => defaultProperties.includes(item) && inputPairs[item]
        )

        if (!bindingHasDefaultProps && !inputHasDefaultProps) {
          pushOrUnshift(defaultPairs)
        } else {
          const pairsToAdd = {}

          for (const key of defaultProperties) {
            const existsInBinding = bindingProperties.includes(key) && bindingPairs[key]
            const existsInInput = inputProperties.includes(key) && inputPairs[key]

            if (!existsInBinding && !existsInInput) {
              pairsToAdd[key] = defaultPairs[key]
            }
          }

          if (Object.keys(pairsToAdd).length > 0) {
            pushOrUnshift(pairsToAdd)
          }
        }

        return method.apply(this, inputArgs)
      }
    }
  },
  multiStream
)

logger.debug('Debug message for testing')

export default logger
