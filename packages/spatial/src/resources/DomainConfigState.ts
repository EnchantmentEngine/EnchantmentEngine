import { defineState } from '@ir-engine/hyperflux'

export const DomainConfigState = defineState({
  name: 'DomainConfigState',
  initial: {
    publicDomain: '',
    cloudDomain: '',
    proxyDomain: ''
  }
})
