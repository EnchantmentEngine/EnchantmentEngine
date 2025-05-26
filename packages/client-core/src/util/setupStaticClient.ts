import config from '@ir-engine/common/src/config'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { getMutableState } from '@ir-engine/hyperflux'

//@ts-ignore
const baseURL = import.meta.env.BASE_URL

const domain = baseURL === '/' ? config.client.clientUrl : baseURL.slice(0, -1)

export const setupStaticClient = () => {
  getMutableState(DomainConfigState).publicDomain.set(domain)
  getMutableState(DomainConfigState).cloudDomain.set(domain)
}
