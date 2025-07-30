import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Project github push service description',
    securities: ['all']
  }
})
