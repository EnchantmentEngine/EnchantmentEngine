import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Github repo access refresh service description',
    securities: ['all']
  }
})
