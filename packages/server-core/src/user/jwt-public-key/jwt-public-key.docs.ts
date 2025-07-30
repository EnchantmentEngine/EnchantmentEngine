import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'JWT Public Key endpoint',
    securities: ['all']
  }
})
