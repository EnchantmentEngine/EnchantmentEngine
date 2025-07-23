import { BufferGeometry, Color, Mesh, MeshBasicMaterial, Quaternion, Raycaster, Vector3 } from 'three'

import {
  Entity,
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { TransformAxis } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { Vector3_Forward } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { CameraGizmoComponent } from '../../classes/gizmo/camera/CameraGizmoComponent'
import { CameraGizmoVisualComponent } from '../../classes/gizmo/camera/CameraGizmoVisualComponent'
import { cameraGizmo, GizmoMaterial, gizmoMaterialProperties } from '../../constants/GizmoPresets'
import { intersectObjectWithRay } from './gizmoCommonFunctions'

const _raycaster = new Raycaster()
_raycaster.layers.enable(ObjectLayers.Gizmos)
_raycaster.firstHitOnly = true

export function cameraGizmoUpdate(gizmoEntity) {
  const cameraGizmo = getComponent(gizmoEntity, CameraGizmoComponent)
  if (cameraGizmo === undefined) return
  if (cameraGizmo.visualEntity === UndefinedEntity) return

  const gizmo = getComponent(cameraGizmo.visualEntity, CameraGizmoVisualComponent)
  if (gizmo === undefined) return

  if (gizmo.gizmo === UndefinedEntity) return

  for (const childEntity of getComponent(gizmo.gizmo, EntityTreeComponent).children) {
    const handle = getComponent(childEntity, ObjectComponent) as Mesh<
      BufferGeometry,
      MeshBasicMaterial & {
        _color: Color
        _opacity: number
      }
    >
    handle.visible = true
    handle.quaternion.identity()
    handle.position.set(0, 0, 0)

    // Hide disabled axes
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.X) === -1 || handle.name.indexOf(TransformAxis.Xn) === -1 || cameraGizmo.showX)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.Y) === -1 || handle.name.indexOf(TransformAxis.Yn) === -1 || cameraGizmo.showY)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.Z) === -1 || handle.name.indexOf(TransformAxis.Zn) === -1 || cameraGizmo.showZ)

    // highlight selected axis

    //handle.material._color = handle.material._color || handle.material.uniforms.color.value
    handle.material._color = handle.material._color || handle.material.color.clone()
    handle.material._opacity = handle.material._opacity || handle.material.opacity

    //setGizmogizmoMaterialProperties(handle.material , handle.material._color , handle.material._opacity, true)

    handle.material.color.copy(handle.material._color)
    handle.material.opacity = handle.material._opacity

    if (!cameraGizmo.enabled || !cameraGizmo.axis || handle.name !== cameraGizmo.axis) continue

    //setGizmoMaterial(handle, GizmoMaterial.YELLOW)
    handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
    handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
  }
}

export function controlUpdate(gizmoEntity) {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!viewerEntity) return
  const sceneRot = getComponent(viewerEntity, TransformComponent).rotation
  const inverse = new Quaternion().copy(sceneRot).invert()
  setComponent(getComponent(gizmoEntity, CameraGizmoComponent).sceneEntity, TransformComponent, {
    rotation: inverse
  })
}

function pointerHover(gizmoEntity) {
  const cameraGizmo = getMutableComponent(gizmoEntity, CameraGizmoComponent)
  const panelInputPointerEntity = InputPointerComponent.getPointersForCamera(cameraGizmo.cameraEntity.value)[0]
  if (!panelInputPointerEntity) return
  if (cameraGizmo.cameraEntity.value === UndefinedEntity) return

  _raycaster.setFromCamera(
    getComponent(panelInputPointerEntity, InputPointerComponent).position,
    getComponent(cameraGizmo.cameraEntity.value, CameraComponent)
  )
  const gizmoVisual = getComponent(cameraGizmo.visualEntity.value, CameraGizmoVisualComponent)
  const intersect = intersectObjectWithRay(getComponent(gizmoVisual.picker, ObjectComponent), _raycaster, true)

  cameraGizmo.axis.set(((intersect as any)?.object?.name as any) ?? null)
}

function pointerDown(gizmoEntity) {
  const cameraGizmoComponent = getComponent(gizmoEntity, CameraGizmoComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(cameraGizmoComponent.cameraEntity)[0]
  if (!inputPointerEntity) return

  const focusCenter = getComponent(
    getState(ReferenceSpaceState).viewerEntity,
    CameraOrbitComponent
  ).cameraOrbitCenter.clone()
  const cameraDistance = focusCenter.distanceTo(
    getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent).position
  )
  const direction = new Vector3().fromArray(cameraGizmo[cameraGizmoComponent.axis!][0][1] as Array<number>).normalize()
  const newRotation = new Quaternion().setFromUnitVectors(Vector3_Forward, direction.normalize())
  const newPosition = focusCenter.clone().add(direction.multiplyScalar(-cameraDistance))

  setComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent, {
    position: newPosition,
    rotation: newRotation
  })
}

/*function pointerMove(gizmoEntity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const targetEntity =
    gizmoControlComponent.controlledEntities.value.length > 1
      ? gizmoControlComponent.pivotEntity.value
      : gizmoControlComponent.controlledEntities.get(NO_PROXY)[0]

  const axis = gizmoControlComponent.axis.value
  const mode = gizmoControlComponent.mode.value
  const entity = targetEntity
  const plane = getComponent(gizmoControlComponent.planeEntity.value, ObjectComponent)

  let space = gizmoControlComponent.space.value

  if (mode === TransformMode.scale) {
    space = TransformSpace.local
  } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
    space = TransformSpace.world
  }

  if (
    entity === UndefinedEntity ||
    axis === null ||
    gizmoControlComponent.dragging.value === false ||
    pointer.movement.length() === 0
  )
    return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointer.position, camera)

  const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)

  if (!planeIntersect) return
  gizmoControlComponent.pointEnd.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))


}*/

export function onGizmoCommit(gizmoEntity) {}

function pointerUp(gizmoEntity) {
  const cameraGizmo = getComponent(gizmoEntity, CameraGizmoComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(cameraGizmo.cameraEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)

  if (pointer.movement.length() !== 0) return
  onGizmoCommit(gizmoEntity)
}

export function onPointerHover(gizmoEntity) {
  const cameraGizmo = getOptionalComponent(gizmoEntity, CameraGizmoComponent)

  if (cameraGizmo === undefined) return
  if (!cameraGizmo.enabled) return
  pointerHover(gizmoEntity)
}

export function onPointerDown(gizmoEntity) {
  const cameraGizmo = getOptionalComponent(gizmoEntity, CameraGizmoComponent)
  if (cameraGizmo === undefined) return

  if (!cameraGizmo.enabled) return

  pointerHover(gizmoEntity)
  pointerDown(gizmoEntity)
}

/*export function onPointerMove(gizmoEntity) {
  const cameraGizmo = getOptionalComponent(gizmoEntity, CameraGizmoComponent)
  if (cameraGizmo === undefined) return

  if (!cameraGizmo.enabled) return

  pointerMove(gizmoEntity)
}*/

export function onPointerUp(gizmoEntity) {
  const cameraGizmo = getOptionalComponent(gizmoEntity, CameraGizmoComponent)
  if (cameraGizmo === undefined) return

  if (!cameraGizmo.enabled) return

  pointerUp(gizmoEntity)
}

export function onPointerLost(gizmoEntity: Entity) {
  setComponent(gizmoEntity, CameraGizmoComponent, { axis: null })
}
