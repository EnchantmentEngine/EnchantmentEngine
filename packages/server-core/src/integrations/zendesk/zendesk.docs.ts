import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Zendesk Authentication service description',
    securities: ['all']
  }
})
