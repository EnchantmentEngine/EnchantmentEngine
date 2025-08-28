export default {
  description: 'Project-scoped tag index for static resources',
  definitions: {
    'static-resource-tag': {
      type: 'object',
      properties: {
        project: { type: 'string' },
        tag: { type: 'string' },
        count: { type: 'number' }
      }
    }
  }
}
