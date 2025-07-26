import { ComponentType, getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { getState } from '@ir-engine/hyperflux'
import { Box3, Frustum, Matrix4, PerspectiveCamera, Quaternion, Sphere, Vector3 } from 'three'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { BoundingBoxComponent, updateBoundingBox } from '../../transform/components/BoundingBoxComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getBoundingBoxVertices } from '../../transform/functions/BoundingBoxFunctions'
import { CameraComponent } from '../components/CameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getOptionalComponent(entity, TargetCameraRotationComponent) as
    | ComponentType<typeof TargetCameraRotationComponent>
    | undefined
  if (!cameraRotationTransition) {
    setComponent(entity, TargetCameraRotationComponent, {
      phi: phi,
      phiVelocity: { value: 0 },
      theta: theta,
      thetaVelocity: { value: 0 },
      time: time
    })
  } else {
    cameraRotationTransition.phi = phi
    cameraRotationTransition.theta = theta
    cameraRotationTransition.time = time
  }
}

/**
 * Computes the distance and center of the camera required to fit the points in the camera's view
 * @param camera - PerspectiveCamera
 * @param pointsToFocus - Points to fit in the camera's view
 * @param padding - Padding value to fit the points in the camera's view
 */
export function computeCameraDistanceAndCenter(
  camera: PerspectiveCamera,
  pointsToFocus: Vector3[],
  padding: number = 1.1
) {
  // Create a bounding sphere from the points

  //NO IDEA why `new Sphere().setFromPoints(pointsToFocus)` stopped properly calculating a center point after working fine for over a month
  const boundingSphere = new Sphere()
  for (const pt of pointsToFocus) {
    //expandByPoint is a workaround to force calculating a real centerpoint, which stopped working with setFromPoints
    boundingSphere.expandByPoint(pt)
  }
  const center = boundingSphere.center
  const radius = boundingSphere.radius

  // Compute the distance required to fit the sphere in the camera's vertical FOV
  const fov = camera.fov * (Math.PI / 180) // Convert FOV to radians
  // const distance = radius / Math.sin(fov / 2);

  // Calculate the distance needed to fit the object in the camera's view, padding value of 1.1 is a good fit for most cases
  const distance = (radius / 2 / Math.tan(fov / 2)) * padding
  return { distance, center }
}

/**
 * Computes the distance and center of the camera required to fit the box in the camera's view
 * @param camera - PerspectiveCamera
 * @param box - Box3 to fit in the camera's view
 * @param padding - Padding value to fit the box in the camera's view
 */
export function computeCameraDistanceAndCenterFromBox(camera: PerspectiveCamera, box: Box3, padding: number = 1.1) {
  const points = getBoundingBoxVertices(box)
  return computeCameraDistanceAndCenter(camera, points, padding)
}
/**
 * Camera view angles enum
 */
export const CameraViewAngle = {
  FRONT: 'front',
  BACK: 'back',
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
  PERSPECTIVE: 'perspective' // Default perspective view for thumbnail
} as const

export type CameraViewAngle = (typeof CameraViewAngle)[keyof typeof CameraViewAngle]

export function setCameraFocusOnBoxFromAngle(
  modelEntity: Entity,
  cameraEntity: Entity,
  viewAngle: CameraViewAngle = CameraViewAngle.PERSPECTIVE
) {
  updateBoundingBox(modelEntity)

  const bbox = getComponent(modelEntity, BoundingBoxComponent).box
  const center = bbox.getCenter(new Vector3())

  // Calculate the bounding sphere radius
  const boundingSphere = bbox.getBoundingSphere(new Sphere())
  const radius = boundingSphere.radius

  const camera = getComponent(cameraEntity, CameraComponent)
  const fov = camera.fov * (Math.PI / 180) // convert vertical fov to radians

  // Calculate the direction vector based on the view angle
  let direction = new Vector3()

  switch (viewAngle) {
    case CameraViewAngle.FRONT:
      direction = new Vector3(0, 0, 1)
      break
    case CameraViewAngle.BACK:
      direction = new Vector3(0, 0, -1)
      break
    case CameraViewAngle.LEFT:
      direction = new Vector3(1, 0, 0)
      break
    case CameraViewAngle.RIGHT:
      direction = new Vector3(-1, 0, 0)
      break
    case CameraViewAngle.TOP:
      direction = new Vector3(0, -1, 0)
      break
    case CameraViewAngle.BOTTOM:
      direction = new Vector3(0, 1, 0)
      break
    case CameraViewAngle.PERSPECTIVE:
    default: {
      const angleY = 30 * (Math.PI / 180) // 30 degrees in radians
      const angleX = 15 * (Math.PI / 180) // 15 degrees in radians
      direction = new Vector3(
        Math.sin(angleY) * Math.cos(angleX),
        Math.sin(angleX),
        Math.cos(angleY) * Math.cos(angleX)
      )
      break
    }
  }

  direction.normalize()

  // Calculate the distance from the camera to the bounding sphere such that it fully frames the content
  const distance = radius / Math.sin(fov / 2)

  // Calculate the camera position
  const cameraPosition = direction.multiplyScalar(distance).add(center)

  // Set the camera transform component
  setComponent(cameraEntity, TransformComponent, { position: cameraPosition })
  TransformComponent.computeTransformMatrix(cameraEntity)

  // Calculate the quaternion rotation to look at the center
  const lookAtMatrix = new Matrix4()
  lookAtMatrix.lookAt(cameraPosition, center, new Vector3(0, 1, 0))
  const targetRotation = new Quaternion().setFromRotationMatrix(lookAtMatrix)

  // Apply the rotation to the camera's TransformComponent
  setComponent(cameraEntity, TransformComponent, { rotation: targetRotation })
  TransformComponent.computeTransformMatrix(cameraEntity)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

  // Update the view camera matrices
  const viewCamera = camera.isArrayCamera ? camera.cameras[0] : camera
  viewCamera.matrixWorld.copy(camera.matrixWorld)
  viewCamera.matrixWorldInverse.copy(camera.matrixWorldInverse)
  viewCamera.projectionMatrix.copy(camera.projectionMatrix)
  viewCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse)
}
export function setCameraFocusOnBox(modelEntity: Entity, cameraEntity: Entity) {
  setCameraFocusOnBoxFromAngle(modelEntity, cameraEntity, CameraViewAngle.PERSPECTIVE)
}

const mat4 = new Matrix4()
const frustum = new Frustum()
const worldPosVec3 = new Vector3()

export const inFrustum = (
  entityToCheck: Entity,
  cameraEntity: Entity = getState(ReferenceSpaceState).viewerEntity
): boolean => {
  if (!cameraEntity) return false

  const camera = getComponent(cameraEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  TransformComponent.getWorldPosition(entityToCheck, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}
