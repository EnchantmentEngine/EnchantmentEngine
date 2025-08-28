import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  InstanceData,
  InstancePatch,
  InstanceQuery,
  InstanceType
} from '@ir-engine/common/src/schemas/networking/instance.schema'
import { RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'

const roomCodeCharacters = '123456789'

export const generateRoomCode = (): RoomCode => {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += roomCodeCharacters.charAt(Math.floor(Math.random() * roomCodeCharacters.length))
  }
  return code as RoomCode
}

export interface InstanceParams extends KnexAdapterParams<InstanceQuery> {}

/**
 * A class for Instance service
 */

export class InstanceService<T = InstanceType, ServiceParams extends Params = InstanceParams> extends KnexService<
  InstanceType,
  InstanceData,
  InstanceParams,
  InstancePatch
> {}
