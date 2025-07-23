export const CREDENTIAL_OFFSET = 60 * 10
//coturn requires the password be hashed via SHA1, tried SHA256 and it didn't work
export const HASH_ALGORITHM = 'sha1'

export interface IceServer {
  urls: string | string[]
  useFixedCredentials?: boolean
  useTimeLimitedCredentials?: boolean
  username?: string
  credential?: string
  webRTCStaticAuthSecretKey?: string
}

export interface WebRTCSettings {
  iceServers: IceServer[]
  useCustomICEServers: boolean
  usePrivateInstanceserverIP: boolean
}

export const defaultIceServer = {
  urls: [],
  useFixedCredentials: false,
  useTimeLimitedCredentials: false
}

export const defaultWebRTCSettings = {
  iceServers: [],
  useCustomICEServers: false,
  usePrivateInstanceserverIP: false
} as WebRTCSettings
