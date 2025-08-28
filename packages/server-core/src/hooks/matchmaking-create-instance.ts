import { Hook, HookContext, Paginated } from '@feathersjs/feathers'

import { matchInstancePath } from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'
import {
  InstanceData,
  InstanceID,
  instancePath,
  InstanceType
} from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, locationPath, LocationType, RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

import { Application } from '../../declarations'
import { getFreeInstanceserver } from '../networking/instance-provision/instance-provision.class'
import logger from '../ServerLogger'

export default (): Hook => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { app, result } = context
    const matchInstanceId = result?.id
    const connection = result?.connection
    const gameMode = result?.gameMode

    if (!connection) {
      // assignment is not found yet
      return context
    }
    if (!gameMode) {
      // throw error?!
      throw new Error('Unexpected response from match finder. ' + JSON.stringify(result))
    }

    const locationName = 'game-' + gameMode
    const location = (await app.service(locationPath).find({
      query: {
        name: locationName
      }
    })) as Paginated<LocationType>
    if (!location.data.length) {
      // throw error?!
      throw new Error(`Location for match type '${gameMode}'(${locationName}) is not found.`)
    }

    const freeInstance = await getFreeInstanceserver({
      app,
      headers: context.params.headers,
      iteration: 0,
      locationId: location.data[0].id as LocationID
    })
    try {
      const existingInstance = (await app.service(instancePath).find({
        query: {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id as LocationID,
          ended: false
        }
      })) as Paginated<InstanceType>

      let instanceId: InstanceID
      if (existingInstance.total === 0) {
        const newInstance = {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id,
          assigned: true,
          assignedAt: toDateTimeSql(new Date()),
          roomCode: '' as RoomCode
        } as InstanceData
        const newInstanceResult = await app.service(instancePath).create(newInstance)
        instanceId = newInstanceResult.id
      } else {
        instanceId = existingInstance.data[0].id
      }

      // matchInstanceId
      await app.service(matchInstancePath).patch(matchInstanceId, {
        instanceServer: instanceId
      })

      context.result.instanceServer = instanceId
    } catch (e) {
      logger.error(e, `Matchmaking instance create error: ${e.message || e.errors[0].message}`)
      // TODO: check error? skip?
    }

    return context
  }
}
