/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Color, Euler, Intersection, Matrix4, MeshBasicMaterial, Quaternion, Raycaster, Vector3 } from 'three'

import {
  ComponentType,
  Engine,
  Entity,
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  isAncestor,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState, State } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Axis, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import {
  TransformAxis,
  TransformAxisType,
  TransformMode,
  TransformSpace,
  TransformSpaceType
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

import { EntityHierarchyLockState } from '@ir-engine/editor/src/services/EntityHierarchyLockState'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { TransformGizmoVisualComponent } from '../classes/gizmo/transform/TransformGizmoVisualComponent'
import { GizmoMaterial, gizmoMaterialProperties } from '../constants/GizmoPresets'
import { SelectionBoxState } from '../panels/viewport/tools/SelectionBoxTool'
import { EditorHistoryFunctions } from '../services/EditorHistoryState'
import { onFocusCamera } from '../systems/EditorControlSystem'
import { ObjectGridSnapState } from '../systems/ObjectGridSnapSystem'
import { EditorControlFunctions } from './EditorControlFunctions'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)
_raycaster.firstHitOnly = true

const _tempQuaternion = new Quaternion()
const _tempVector = new Vector3()
const _tempVector2 = new Vector3()

const _offset = new Vector3()
const _startNorm = new Vector3()
const _endNorm = new Vector3()

const _positionStart = new Vector3()
const _positionMultiStart: Record<Entity, Vector3> = {}
const _quaternionStart = new Quaternion()
const _quaternionMultiStart: Record<Entity, Quaternion> = {}
const _scaleStart = new Vector3()
const _scaleMultiStart: Record<Entity, Vector3> = []

const _worldQuaternionInv = new Quaternion()

const _parentQuaternionInv = new Quaternion()
const _parentScale = new Vector3()

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _lookAtMatrix = new Matrix4()
const _dirVector = new Vector3()
const _tempMatrix = new Matrix4()

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

const _targetWorldPosition = new Vector3()

export function gizmoUpdate(gizmoControlEntity) {
  const gizmoControl = getComponent(gizmoControlEntity, TransformGizmoControlComponent)
  if (!gizmoControl.visualEntity) return
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!viewerEntity) return // TODO: get the viewerEntity from the visualEntity to handle multiple viewports
  const gizmoVisual = getComponent(gizmoControl.visualEntity, TransformGizmoVisualComponent)
  const pivotTransform = getComponent(gizmoControl.pivotEntity, TransformComponent)
  const position = pivotTransform.position
  const rotation = pivotTransform.rotation

  const camera = getComponent(viewerEntity, CameraComponent)
  const eye = gizmoControl.eye.subVectors(camera.position, position).normalize()

  const scaleFactor =
    position.distanceTo(camera.position) * Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)

  setComponent(gizmoVisual.gizmo, TransformComponent, { position })
  setComponent(gizmoVisual.picker, TransformComponent, { position })
  setComponent(gizmoVisual.helper, TransformComponent, { position: Vector3_Zero })

  for (const helperEntity of getComponent(gizmoVisual.helper, EntityTreeComponent).children) {
    removeComponent(helperEntity, VisibleComponent)
    const transform = getComponent(helperEntity, TransformComponent)
    transform.rotation.identity()
    transform.scale.set(1, 1, 1).multiplyScalar((scaleFactor * gizmoControl.size) / 4)
    transform.position.set(0, 0, 0)
    const name = getComponent(helperEntity, NameComponent)

    if (name === 'AXIS') {
      if (gizmoControl.axis) setComponent(helperEntity, VisibleComponent)
      transform.position.copy(position)

      if (gizmoControl.axis === TransformAxis.X) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
        transform.rotation.copy(rotation).multiply(_tempQuaternion)

        if (Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(rotation).dot(eye)) > 0.9) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.Y) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
        transform.rotation.copy(rotation).multiply(_tempQuaternion)

        if (Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(rotation).dot(eye)) > 0.9) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.Z) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        transform.rotation.copy(rotation).multiply(_tempQuaternion)

        if (Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(rotation).dot(eye)) > 0.9) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.XYZE) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        _alignVector.copy(gizmoControl.rotationAxis)
        transform.rotation.setFromRotationMatrix(
          _lookAtMatrix.lookAt(Vector3_Zero, _alignVector, Axis[TransformAxis.Y])
        )
        transform.rotation.multiply(_tempQuaternion)
        if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
      }

      if (gizmoControl.axis === TransformAxis.E) {
        removeComponent(helperEntity, VisibleComponent)
      }
    } else if (name === 'START') {
      transform.position.copy(gizmoControl.pivotStartPosition)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else if (name === 'END') {
      transform.position.copy(position)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else if (name === 'DELTA') {
      transform.position.copy(gizmoControl.pivotStartPosition)
      transform.rotation.copy(gizmoControl.pivotStartRotation)
      _tempVector.set(1e-10, 1e-10, 1e-10).add(gizmoControl.pivotStartPosition).sub(position).multiplyScalar(-1)
      _tempVector.applyQuaternion(gizmoControl.pivotStartRotation.clone().invert())
      transform.scale.copy(_tempVector)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else {
      transform.rotation.copy(rotation)
      transform.position.copy(position)
      if (gizmoControl.axis) {
        if (gizmoControl.axis.search(name) !== -1) setComponent(helperEntity, VisibleComponent)
      }
    }
  }

  const handles = [
    ...getComponent(gizmoVisual.picker, EntityTreeComponent).children,
    ...getComponent(gizmoVisual.gizmo, EntityTreeComponent).children
  ]

  for (const handleEntity of handles) {
    setComponent(handleEntity, VisibleComponent)
    const name = getComponent(handleEntity, NameComponent)
    const transform = getComponent(handleEntity, TransformComponent)

    // Align handles to current local or world rotation
    transform.rotation.copy(rotation)
    transform.position.set(0, 0, 0)
    transform.scale.set(1, 1, 1).multiplyScalar((scaleFactor * gizmoControl.size) / 4)

    if (gizmoControl.mode === TransformMode.translate || gizmoControl.mode === TransformMode.scale) {
      // Hide translate and scale axis facing the camera

      const AXIS_HIDE_THRESHOLD = 0.99
      const PLANE_HIDE_THRESHOLD = 0.2

      if (name === TransformAxis.X) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(rotation).dot(eye)) > AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.Y) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(rotation).dot(eye)) > AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.Z) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(rotation).dot(eye)) > AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.XY) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(rotation).dot(eye)) < PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.YZ) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(rotation).dot(eye)) < PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.XZ) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(rotation).dot(eye)) < PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }
    } else if (gizmoControl.mode === TransformMode.rotate) {
      // Align handles to current local or world rotation

      _alignVector.copy(eye).applyQuaternion(_tempQuaternion.copy(rotation).invert())

      if (name.search(TransformAxis.E) !== -1) {
        transform.rotation.setFromRotationMatrix(_lookAtMatrix.lookAt(eye, Vector3_Zero, Axis[TransformAxis.Y]))
      }

      if (name === TransformAxis.X) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.X], Math.atan2(-_alignVector.y, _alignVector.z))
        _tempQuaternion.multiplyQuaternions(rotation.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }

      if (name === TransformAxis.Y) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.Y], Math.atan2(_alignVector.x, _alignVector.z))
        _tempQuaternion.multiplyQuaternions(rotation.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }

      if (name === TransformAxis.Z) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.Z], Math.atan2(_alignVector.y, _alignVector.x))
        _tempQuaternion.multiplyQuaternions(rotation.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }
    }
    // Hide disabled axes

    const visible =
      (name.indexOf(TransformAxis.X) > -1 && gizmoControl.showX) ||
      (name.indexOf(TransformAxis.Y) > -1 && gizmoControl.showY) ||
      (name.indexOf(TransformAxis.Z) > -1 && gizmoControl.showZ) ||
      (name.indexOf(TransformAxis.E) > -1 && gizmoControl.showX && gizmoControl.showY && gizmoControl.showZ)

    if (visible) {
      setComponent(handleEntity, VisibleComponent)
    } else {
      removeComponent(handleEntity, VisibleComponent)
    }

    // highlight selected axis

    const material = getComponent(handleEntity, MeshComponent).material as MeshBasicMaterial & {
      _color: Color
      _opacity: number
    }

    //material._color = material._color ?? material.uniforms.color.value
    material._color = material._color ?? material.color.clone()
    material._opacity = material._opacity ?? material.opacity

    material.color.copy(material._color)
    material.opacity = material._opacity

    if (gizmoControl.axis) {
      if (name.split('').every((axis) => gizmoControl.axis!.includes(axis))) {
        material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
        material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
      }
    }
  }

  planeUpdate(gizmoControlEntity)
}

export function planeUpdate(gizmoEntity) {
  // update plane entity
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  const pivotTransform = getComponent(gizmoControl.pivotEntity, TransformComponent)

  setComponent(gizmoControl.planeEntity, TransformComponent, { position: pivotTransform.position })
  const planeTransform = getComponent(gizmoControl.planeEntity, TransformComponent)

  _v1.copy(Axis[TransformAxis.X]).applyQuaternion(pivotTransform.rotation)
  _v2.copy(Axis[TransformAxis.Y]).applyQuaternion(pivotTransform.rotation)
  _v3.copy(Axis[TransformAxis.Z]).applyQuaternion(pivotTransform.rotation)

  // Align the plane for current transform mode, axis and space.

  _alignVector.copy(_v2)

  switch (gizmoControl.mode) {
    case TransformMode.translate:
    case TransformMode.scale:
      switch (gizmoControl.axis) {
        case TransformAxis.X:
          _alignVector.copy(gizmoControl.eye).cross(_v1)
          _dirVector.copy(_v1).cross(_alignVector)
          break
        case TransformAxis.Y:
          _alignVector.copy(gizmoControl.eye).cross(_v2)
          _dirVector.copy(_v2).cross(_alignVector)
          break
        case TransformAxis.Z:
          _alignVector.copy(gizmoControl.eye).cross(_v3)
          _dirVector.copy(_v3).cross(_alignVector)
          break
        case TransformAxis.XY:
          _dirVector.copy(_v3)
          break
        case TransformAxis.YZ:
          _dirVector.copy(_v1)
          break
        case TransformAxis.XZ:
          _alignVector.copy(_v3)
          _dirVector.copy(_v2)
          break
        case TransformAxis.XYZ:
        case TransformAxis.E:
          _dirVector.set(0, 0, 0)
          break
      }

      break
    case TransformMode.rotate:
    default:
      // special case for rotate
      _dirVector.set(0, 0, 0)
  }
  if (_dirVector.length() === 0) {
    // If in rotate mode, make the plane parallel to camera
    const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
    planeTransform.rotation.copy(camera.rotation)
  } else {
    _tempMatrix.lookAt(Vector3_Zero, _dirVector, _alignVector)
    planeTransform.rotation.setFromRotationMatrix(_tempMatrix)
  }
}

function applyTranslate(gizmoEntity: Entity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  const pointStart = gizmoControl.pointerPlaneStartPosition
  const pointEnd = gizmoControl.pointerPlaneEndPosition
  const axis = gizmoControl.axis!
  const space = gizmoControl.space
  const translationSnap = gizmoControl.translationSnap
  const pivotEntity = gizmoControl.pivotEntity

  const pivotRotInv = _worldQuaternionInv.copy(gizmoControl.pivotStartRotation).invert()

  _offset.copy(pointEnd).sub(pointStart)

  if (space === TransformSpace.local) {
    _offset.applyQuaternion(pivotRotInv)
  }

  if (axis.indexOf(TransformAxis.X) === -1) _offset.x = 0
  if (axis.indexOf(TransformAxis.Y) === -1) _offset.y = 0
  if (axis.indexOf(TransformAxis.Z) === -1) _offset.z = 0

  if (translationSnap) {
    if (axis.search(TransformAxis.X) !== -1) {
      _offset.x = Math.round(_offset.x / translationSnap) * translationSnap
    }
    if (axis.search(TransformAxis.Y) !== -1) {
      _offset.y = Math.round(_offset.y / translationSnap) * translationSnap
    }
    if (axis.search(TransformAxis.Z) !== -1) {
      _offset.z = Math.round(_offset.z / translationSnap) * translationSnap
    }
  }

  if (space === TransformSpace.local) {
    _offset.applyQuaternion(gizmoControl.pivotStartRotation)
  }

  for (const eid of [pivotEntity, ...gizmoControl.controlledEntities]) {
    if (EntityHierarchyLockState.isEntityLocked(eid)) continue
    const transform = _targetStartWorldTransforms.get(eid)!
    const pos = _v1.setFromMatrixPosition(transform).add(_offset)
    EditorControlFunctions.positionObject([eid], [pos], TransformSpace.world)
  }
}

function applyScale(
  entity: Entity,
  pointStart: Vector3,
  pointEnd: Vector3,
  axis: TransformAxisType,
  scaleSnap: number | null,
  pivotControlledEntity = false
) {
  if (axis.search(TransformAxis.XYZ) !== -1) {
    let d = pointEnd.length() / pointStart.length()

    if (pointEnd.dot(pointStart) < 0) d *= -1

    _tempVector2.set(d, d, d)
  } else {
    _tempVector.copy(pointStart)
    _tempVector2.copy(pointEnd)

    TransformComponent.getWorldRotation(entity, _worldQuaternionInv).invert()
    _tempVector.applyQuaternion(_worldQuaternionInv)
    _tempVector2.applyQuaternion(_worldQuaternionInv)

    _tempVector2.divide(_tempVector)

    if (axis.search(TransformAxis.X) === -1) {
      _tempVector2.x = 1
    }

    if (axis.search(TransformAxis.Y) === -1) {
      _tempVector2.y = 1
    }

    if (axis.search(TransformAxis.Z) === -1) {
      _tempVector2.z = 1
    }
  }

  // Apply scale
  const newScale = getComponent(entity, TransformComponent).scale
  const locked = EntityHierarchyLockState.isEntityLocked(entity)

  if (locked) return newScale
  newScale.copy(pivotControlledEntity ? _scaleMultiStart[entity] : _scaleStart).multiply(_tempVector2)

  if (scaleSnap) {
    if (axis.search(TransformAxis.X) !== -1) {
      newScale.x = Math.round(newScale.x / scaleSnap) * scaleSnap || scaleSnap
    }

    if (axis.search(TransformAxis.Y) !== -1) {
      newScale.y = Math.round(newScale.y / scaleSnap) * scaleSnap || scaleSnap
    }

    if (axis.search(TransformAxis.Z) !== -1) {
      newScale.z = Math.round(newScale.z / scaleSnap) * scaleSnap || scaleSnap
    }
  }

  return newScale
}

function applyRotation(
  entity: Entity,
  gizmoControlComponent: State<ComponentType<typeof TransformGizmoControlComponent>>,
  axis: TransformAxisType,
  space: TransformSpaceType
) {
  _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)
  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)

  const ROTATION_SPEED =
    20 / gizmoControlComponent.worldPosition.value.distanceTo(_tempVector.setFromMatrixPosition(camera.matrixWorld))

  let _inPlaneRotation = false

  if (axis === TransformAxis.XYZE) {
    gizmoControlComponent.rotationAxis.set(_offset.cross(gizmoControlComponent.eye.value).normalize())
    gizmoControlComponent.rotationAngle.set(
      _offset.dot(_tempVector.copy(gizmoControlComponent.rotationAxis.value).cross(gizmoControlComponent.eye.value)) *
        ROTATION_SPEED
    )
  } else if (axis === TransformAxis.X || axis === TransformAxis.Y || axis === TransformAxis.Z) {
    gizmoControlComponent.rotationAxis.set(Axis[axis])

    _tempVector.copy(Axis[axis])

    if (space === TransformSpace.local) {
      _tempVector.applyQuaternion(gizmoControlComponent.worldQuaternion.value)
    }

    _tempVector.cross(gizmoControlComponent.eye.value)

    // When _tempVector is 0 after cross with this.eye the vectors are parallel and should use in-plane rotation logic.
    if (_tempVector.length() === 0) {
      _inPlaneRotation = true
    } else {
      gizmoControlComponent.rotationAngle.set(_offset.dot(_tempVector.normalize()) * ROTATION_SPEED)
    }
  }

  if (axis === TransformAxis.E || _inPlaneRotation) {
    gizmoControlComponent.rotationAxis.set(gizmoControlComponent.eye.value)
    gizmoControlComponent.rotationAngle.set(
      gizmoControlComponent.pointEnd.value.angleTo(gizmoControlComponent.pointStart.value)
    )

    _startNorm.copy(gizmoControlComponent.pointStart.value).normalize()
    _endNorm.copy(gizmoControlComponent.pointEnd.value).normalize()

    gizmoControlComponent.rotationAngle.set(
      gizmoControlComponent.rotationAngle.value *
        (_endNorm.cross(_startNorm).dot(gizmoControlComponent.eye.value) < 0 ? 1 : -1)
    )
  }

  // Apply rotation snap

  if (gizmoControlComponent.rotationSnap.value)
    gizmoControlComponent.rotationAngle.set(
      Math.round(gizmoControlComponent.rotationAngle.value / gizmoControlComponent.rotationSnap.value) *
        gizmoControlComponent.rotationSnap.value
    )
  const newRotation = getComponent(entity, TransformComponent).rotation
  const locked = EntityHierarchyLockState.isEntityLocked(entity)

  if (locked) return newRotation
  // Apply rotate
  if (space === TransformSpace.local && axis !== TransformAxis.E && axis !== TransformAxis.XYZE) {
    newRotation.copy(gizmoControlComponent.worldQuaternionStart.value)
    newRotation
      .multiply(
        _tempQuaternion.setFromAxisAngle(
          gizmoControlComponent.rotationAxis.value,
          gizmoControlComponent.rotationAngle.value
        )
      )
      .normalize()
  } else {
    const rotAxis = new Vector3().copy(gizmoControlComponent.rotationAxis.value)
    rotAxis.applyQuaternion(_parentQuaternionInv)
    gizmoControlComponent.rotationAxis.set(rotAxis)
    newRotation.copy(
      _tempQuaternion.setFromAxisAngle(
        gizmoControlComponent.rotationAxis.value,
        gizmoControlComponent.rotationAngle.value
      )
    )
    newRotation.multiply(gizmoControlComponent.worldQuaternionStart.value).normalize()
  }

  return newRotation
}

function applyPivotRotation(entity, pivotToOriginMatrix, originToPivotMatrix, rotationMatrix) {
  _tempMatrix.compose(_positionMultiStart[entity], _quaternionMultiStart[entity], _scaleMultiStart[entity])
  _tempMatrix
    .premultiply(pivotToOriginMatrix)
    .premultiply(rotationMatrix)
    .premultiply(originToPivotMatrix)
    .decompose(_tempVector, _tempQuaternion, _tempVector2)
  return { newPosition: _tempVector, newRotation: _tempQuaternion, newScale: _tempVector2 }
}

export function onPointerHover(gizmoEntity: Entity, pointerEntities: Entity[]) {
  const gizmoControl = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl.dragging.value === true) return
  const gizmoVisual = getComponent(gizmoControl.visualEntity.value, TransformGizmoVisualComponent)

  for (const pointerEntity of pointerEntities) {
    const intersections = getComponent(pointerEntity, InputSourceComponent).intersections
    for (const intersection of intersections) {
      if (isAncestor(gizmoVisual.picker, intersection.entity)) {
        const axis = getComponent(intersection.entity, NameComponent)
        gizmoControl.axis.set(axis as keyof typeof TransformAxis)
        return
      }
    }
  }

  gizmoControl.axis.set(null)
  // TODO: SelectionBoxState logic should NOT be here. Separation of concerns.
  getMutableState(SelectionBoxState).gizmoInControl.set(false)
}

const _targetStartWorldTransforms = new Map<Entity, Matrix4>()

export function onPointerDown(gizmoEntity: Entity, pointerEntity: Entity) {
  // TODO support gizmos in multiple viewports
  // (we will need to maintain separate gizmo visuals for each viewport)
  const gizmoControl = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const planeIntersect = getPointerPlaneIntersect(gizmoEntity, pointerEntity)
  const pivotEntity = gizmoControl.pivotEntity.value
  const transform = getComponent(pivotEntity, TransformComponent)
  gizmoControl.pivotStartPosition.set(transform.position.clone())
  gizmoControl.pivotStartRotation.set(transform.rotation.clone())
  gizmoControl.pointerPlaneStartPosition.set(planeIntersect.point.clone())
  gizmoControl.pointerPlaneEndPosition.set(planeIntersect.point.clone())
  _targetStartWorldTransforms.clear()
  _targetStartWorldTransforms.set(pivotEntity, transform.matrixWorld.clone())
  for (const cEntity of gizmoControl.controlledEntities.value) {
    const cTransform = getComponent(cEntity, TransformComponent)
    _targetStartWorldTransforms.set(cEntity, cTransform.matrixWorld.clone())
  }
  gizmoControl.dragging.set(true)
}

export function onPointerDrag(gizmoEntity: Entity, pointerEntity: Entity) {
  // TODO support gizmos in multiple viewports
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const pivotEntity = gizmoControlComponent.pivotEntity.value
  const axis = gizmoControlComponent.axis.value
  const mode = gizmoControlComponent.mode.value
  const space = gizmoControlComponent.space.value
  if (!axis) return

  const planeIntersect = getPointerPlaneIntersect(gizmoEntity, pointerEntity)
  gizmoControlComponent.pointerPlaneEndPosition.set(planeIntersect.point.clone())

  if (mode === TransformMode.translate) {
    applyTranslate(gizmoEntity)
  } else if (mode === TransformMode.scale) {
    const newScale = applyScale(
      pivotEntity,
      gizmoControlComponent.pointStart.value,
      gizmoControlComponent.pointEnd.value,
      axis,
      gizmoControlComponent.scaleSnap.value
    )
    EditorControlFunctions.scaleObject([pivotEntity], [newScale], true)
    for (const cEntity of gizmoControlComponent.controlledEntities.value) {
      const newScale = applyScale(
        cEntity,
        gizmoControlComponent.pointStart.value,
        gizmoControlComponent.pointEnd.value,
        axis,
        gizmoControlComponent.scaleSnap.value,
        true
      )
      const newPosition = getComponent(cEntity, TransformComponent).position
      const newDistance = _positionMultiStart[cEntity].clone().sub(_positionStart.clone()).multiply(_tempVector2)
      newPosition.copy(newDistance.add(_positionStart))
      EditorControlFunctions.scaleObject([cEntity], [newScale], true)
      EditorControlFunctions.positionObject([cEntity], [newPosition])
    }
  } else if (mode === TransformMode.rotate) {
    const newRotation = applyRotation(pivotEntity, gizmoControlComponent, axis, space)
    EditorControlFunctions.rotateObject([pivotEntity], [newRotation])
    const pivotToOriginMatrix = _tempMatrix
      .clone()
      .makeTranslation(-_positionStart.x, -_positionStart.y, -_positionStart.z)
    const originToPivotMatrix = _tempMatrix
      .clone()
      .makeTranslation(_positionStart.x, _positionStart.y, _positionStart.z)
    const rotationMatrix = _tempMatrix
      .clone()
      .makeRotationAxis(
        space === TransformSpace.local
          ? Axis[axis].clone().applyQuaternion(gizmoControlComponent.worldQuaternion.value)
          : gizmoControlComponent.rotationAxis.value,
        gizmoControlComponent.rotationAngle.value
      )
    for (const cEntity of gizmoControlComponent.controlledEntities.value) {
      const { newPosition, newRotation, newScale } = applyPivotRotation(
        cEntity,
        pivotToOriginMatrix,
        originToPivotMatrix,
        rotationMatrix
      )
      EditorControlFunctions.positionObject([cEntity], [newPosition])
      EditorControlFunctions.rotateObject([cEntity], [newRotation])
      EditorControlFunctions.scaleObject([cEntity], [newScale], true)
    }
  }
}

export function onPointerUp(gizmoEntity: Entity, pointerEntity: Entity) {
  const gizmoControl = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const pointStart = gizmoControl.pointerPlaneStartPosition.value
  const pointEnd = gizmoControl.pointerPlaneEndPosition.value
  _offset.copy(pointEnd).sub(pointStart)
  const didMove = _offset.length() > 0.0001
  gizmoControl.dragging.set(false)
  gizmoControl.axis.set(null)
  removeComponent(gizmoControl.planeEntity.value, VisibleComponent)
  if (!didMove) {
    onFocusCamera()
  } else {
    if (getState(ObjectGridSnapState).enabled) ObjectGridSnapState.apply()
    EditorHistoryFunctions.setComponent(gizmoControl.controlledEntities.value as Entity[], TransformComponent)
  }
}

function getPointerPlaneIntersect(gizmoEntity: Entity, pointerEntity: Entity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  setComponent(gizmoControl.planeEntity, VisibleComponent)
  const plane = getComponent(gizmoControl.planeEntity, ObjectComponent)
  const pointer = getComponent(pointerEntity, InputPointerComponent)
  const camera = getComponent(pointer.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointer.position, camera)
  const intersections = [] as Intersection[]
  plane.raycast(_raycaster, intersections)
  return intersections[0]
}
