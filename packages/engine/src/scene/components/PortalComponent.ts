import { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { EntityTreeComponent, createEntity, useEntityContext } from '@ir-engine/ecs'
import { ComponentType, defineComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const PortalState = defineState({
  name: 'PortalState',
  initial: {
    lastPortalTimeout: 0,
    portalTimeoutDuration: 5000,
    activePortalEntity: UndefinedEntity,
    portalReady: false
  }
})

export const PortalComponent = defineComponent({
  name: 'PortalComponent',
  jsonID: 'EE_portal',

  schema: S.Object({
    linkedPortalId: S.EntityID(),
    location: S.String({ default: '' }),
    effectType: S.String({ default: 'None' }),
    previewType: S.String({ default: PortalPreviewTypeSimple }),
    previewImageURL: S.String({ default: '' }),
    redirect: S.Bool({ default: false }),
    spawnPosition: T.Vec3(),
    spawnRotation: T.Quaternion(),
    remoteSpawnPosition: T.Vec3(),
    remoteSpawnRotation: T.Quaternion(),
    mesh: S.Type<Mesh<SphereGeometry, MeshBasicMaterial>>({ serialized: false })
  }),

  reactor: function () {
    const entity = useEntityContext()

    useEffect(() => {
      setCallback(entity, 'teleport', (triggerEntity: Entity, otherEntity: Entity) => {
        if (otherEntity !== AvatarComponent.getSelfAvatarEntity()) return
        const now = Date.now()
        const { lastPortalTimeout, portalTimeoutDuration, activePortalEntity } = getState(PortalState)
        if (activePortalEntity || lastPortalTimeout + portalTimeoutDuration > now) return
        getMutableState(PortalState).activePortalEntity.set(entity)
      })

      /** Allow scene data populating rigidbody component too */
      if (hasComponent(entity, RigidBodyComponent)) return
      setComponent(entity, RigidBodyComponent, { type: 'fixed' })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Sphere,
        collisionLayer: CollisionGroups.Trigger,
        collisionMask: CollisionGroups.Avatars
      })
      setComponent(entity, TriggerComponent, {
        triggers: [
          {
            onEnter: 'teleport',
            onExit: '',
            target: '' as EntityID
          }
        ]
      })
    }, [])

    // const [portalGeometry] = useResource<SphereGeometry>(new SphereGeometry(1, 32, 32), entity)
    // const [portalMesh] = useDisposable(
    //   Mesh<SphereGeometry, MeshBasicMaterial>,
    //   entity,
    //   portalGeometry.value as SphereGeometry,
    //   new MeshBasicMaterial({ side: BackSide })
    // )

    // useEffect(() => {
    //   if (portalComponent.previewType.value !== PortalPreviewTypeSpherical) return
    //   portalComponent.mesh.set(portalMesh)
    //   addObjectToGroup(entity, portalMesh)
    //   return () => {
    //     removeObjectFromGroup(entity, portalMesh)
    //   }
    // }, [portalComponent.previewType.value])

    /** @todo - reimplement once spawn points are refactored */
    // const portalDetails = useGet(spawnPointPath, portalComponent.linkedPortalId.value)

    // const [texture] = useTexture(portalDetails.data?.previewImageURL || '', entity)

    // useEffect(() => {
    //   if (!texture || !portalComponent.mesh.value) return

    //   const material = portalComponent.mesh.value.material as MeshBasicMaterial
    //   material.map = texture
    //   material.needsUpdate = true
    // }, [texture, portalComponent.mesh])

    // useEffect(() => {
    //   if (!portalDetails.data) return
    //   portalComponent.remoteSpawnPosition.value.copy(portalDetails.data.position as Vector3)
    //   portalComponent.remoteSpawnRotation.value.copy(portalDetails.data.rotation as Quaternion)
    // }, [portalDetails])

    return null
  },

  setPlayerInPortalEffect: (effectType: string) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent)
    setComponent(entity, NameComponent, 'portal-' + effectType)
    setComponent(entity, VisibleComponent)
    setComponent(entity, PortalEffects.get(effectType))
  }
})
