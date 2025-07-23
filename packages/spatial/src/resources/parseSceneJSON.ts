import { getState } from '@ir-engine/hyperflux'
import { DomainConfigState } from './DomainConfigState'

export const pathIndentifiers = {
  sceneRelative: '__$project$__',
  sceneCors: '__$cors-proxy$__'
}

const createMap = (domains) => ({
  [pathIndentifiers.sceneRelative]: `${domains.cloudDomain}/projects`,
  [pathIndentifiers.sceneCors]: domains.proxyDomain
})

const transformURL = (url, domains, isCleaning = false) => {
  const map = createMap(domains)
  for (const [placeholder, domain] of Object.entries(map)) {
    url = isCleaning ? url.replace(domain, placeholder) : url.replace(placeholder, domain)
  }
  return url
}

const transformData = (data, domains, isCleaning = false) => {
  if (typeof data === 'string') return transformURL(data, domains, isCleaning)
  if (typeof data === 'object' && data !== null) {
    for (const key in data) data[key] = transformData(data[key], domains, isCleaning)
  }
  return data
}

export const parseStorageProviderURLs = (data, domains = getState(DomainConfigState)) => transformData(data, domains)

export const cleanStorageProviderURLs = (data, domains = getState(DomainConfigState)) =>
  transformData(data, domains, true)
