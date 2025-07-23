import multiLogger from '@ir-engine/common/src/logger'
import fetch from 'node-fetch'
import config from '../../appconfig'

const logger = multiLogger.child({ component: 'server-core:ip-geolocation' })

/**
 * Interface for ipinfo.io API response
 */
export interface IpInfoResponse {
  ip: string
  country: string
  country_code: string
  continent: string
  continent_code: string
  city?: string
  region?: string
  loc?: string
  org?: string
  postal?: string
  timezone?: string
}

/**
 * Get country name from IP address using ipinfo.io API
 * @param ipAddress IP address to lookup
 * @returns Full country name or undefined if lookup fails
 */
export const getCountryFromIP = async (ipAddress: string | undefined): Promise<string | undefined> => {
  if (!ipAddress || ipAddress === '::1' || ipAddress === 'localhost') {
    return 'Local System'
  }

  try {
    // Get IP geolocation settings from server config
    const { apiUrl, apiToken } = config.server.ipGeolocation

    const response = await fetch(`${apiUrl}/${ipAddress}?token=${apiToken}`)

    if (!response.ok) {
      logger.error(`Error fetching country from IP: ${response.statusText}`)
      return undefined
    }

    const data = (await response.json()) as IpInfoResponse

    // ipinfo.io directly provides the full country name
    return data.country || undefined
  } catch (error) {
    logger.error('Error fetching country from IP:', error)
    return undefined
  }
}
