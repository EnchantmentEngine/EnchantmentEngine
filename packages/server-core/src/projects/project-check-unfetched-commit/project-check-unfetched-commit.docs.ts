import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Project check unfetched commit service description',
    securities: ['all']
  }
})
