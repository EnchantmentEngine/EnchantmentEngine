import { KnexSeed } from '@ir-engine/common/src/interfaces/KnexSeed'

import * as inviteTypeSeed from './invite-type/invite-type.seed'
import * as locationSettingSeed from './location-setting/location-setting.seed'
import * as locationTypeSeed from './location-type/location-type.seed'

export const socialSeeds: Array<KnexSeed> = [locationTypeSeed, locationSettingSeed, inviteTypeSeed]
