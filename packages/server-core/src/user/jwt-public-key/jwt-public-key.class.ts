import { Params, ServiceInterface } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import appconfig from '../../appconfig'

import { createHash } from 'crypto'
import * as jose from 'jose'

/**
 * A class for Login service
 */
export class JWTPublicKeyService implements ServiceInterface {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A function which find specific login details
   *
   * @param params
   * @returns {token}
   */
  async find(params?: Params) {
    if (appconfig.authentication.jwtAlgorithm !== 'RS256' || typeof appconfig.authentication.jwtPublicKey !== 'string')
      return {}
    const publicKey = await jose.importSPKI(appconfig.authentication.jwtPublicKey, 'RS256')
    let jwk = await jose.exportJWK(publicKey)
    jwk.kid = createHash('sha3-256').update(appconfig.authentication.jwtPublicKey).digest('hex')
    jwk.alg = 'RS256'
    jwk.use = 'sig'
    jwk.x5c = [
      appconfig.authentication.jwtPublicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replaceAll('\n', '')
    ]
    jwk['x5t#S256'] = await jose.calculateJwkThumbprint(jwk, 'sha256')
    return {
      keys: [jwk]
    }
  }
}
