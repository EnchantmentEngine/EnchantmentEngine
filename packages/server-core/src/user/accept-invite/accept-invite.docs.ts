import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Accept invite service description',
    securities: ['all'],
    schemas: {
      getResponse: {
        type: 'object',
        additionalProperties: {
          type: 'string'
        }
      }
    },
    refs: {
      getResponse: 'getResponse'
    }
  }
})
