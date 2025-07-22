import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Logs api service description',
    securities: ['all'],
    definitions: {
      ['logs-api']: {
        type: 'object',
        properties: {
          msg: {
            type: 'string'
          },
          level: {
            type: 'string'
          }
        },
        additionalProperties: {
          type: 'string'
        }
      }
    }
  }
})
