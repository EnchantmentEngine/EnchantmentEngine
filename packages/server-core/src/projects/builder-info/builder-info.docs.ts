import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Builder info service description',
    securities: ['all']
  }
})
