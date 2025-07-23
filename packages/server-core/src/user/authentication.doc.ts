import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {},
  docs: {
    description: 'Authentication service description',
    idNames: {
      remove: 'accessToken'
    },
    idType: 'string',
    securities: ['remove'],
    schemas: {
      authRequest: {
        type: 'object',
        properties: {
          strategy: { type: 'string', default: 'jwt' },
          accessToken: { type: 'string' }
        }
      },
      authResult: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          authentication: {
            type: 'object',
            properties: {
              strategy: { type: 'string' },
              accessToken: { type: 'string' }
            },
            payload: {
              type: 'object',
              properties: {
                iat: { type: 'string' },
                exp: { type: 'string' },
                sub: { type: 'string' },
                jti: { type: 'string' }
              }
            }
          },
          'identity-provider': { $ref: '#/components/schemas/IdentityProvider' }
        }
      }
    },
    refs: {
      createRequest: 'authRequest',
      removeRequest: 'authRequest',
      createResponse: 'authResult',
      removeResponse: 'authResult'
    },
    operations: {
      remove: {}
    }
  }
})
