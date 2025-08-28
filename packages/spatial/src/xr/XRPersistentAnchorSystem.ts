import { Quaternion, Vector3 } from 'three'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'

import { ReferenceSpace, XRState } from './XRState'
import { XRSystem } from './XRSystem'

/**
 * XRPersistentAnchorSystem
 *   adapted from https://github.com/mrdoob/three.js/pull/24872/files
 */

declare global {
  interface XRAnchor {
    requestPersistentHandle?(): Promise<string>
  }
  interface XRSession {
    restorePersistentAnchor?(uuid: string): Promise<XRAnchor>
    deletePersistentAnchor?(uuid: string): Promise<void>
  }
}

const createAnchor = async (xrFrame: XRFrame, position: Vector3, rotation: Quaternion) => {
  const referenceSpace = ReferenceSpace.origin
  if (xrFrame && referenceSpace) {
    const anchorPose = new XRRigidTransform(position, rotation)
    return await xrFrame.createAnchor?.(anchorPose, referenceSpace)
  } else {
    throw new Error('XRFrame not available.')
  }
}

const createPersistentAnchor = async (xrFrame: XRFrame, position: Vector3, rotation: Quaternion) => {
  const referenceSpace = ReferenceSpace.origin
  if (xrFrame && referenceSpace) {
    const anchorPose = new XRRigidTransform(position, rotation)
    const anchor = await xrFrame.createAnchor?.(anchorPose, referenceSpace)!
    try {
      const handle = await anchor.requestPersistentHandle?.()
      return [anchor, handle] as [XRAnchor, string | undefined]
    } catch (e) {
      anchor.delete()
      throw e
    }
  } else {
    throw new Error('XRFrame not available.')
  }
}

const restoreAnchor = async (xrFrame: XRFrame, uuid: string) => {
  if (xrFrame?.session) {
    return await xrFrame.session.restorePersistentAnchor?.(uuid)
  } else {
    throw new Error('XRSession not available.')
  }
}

const deleteAnchor = async (xrFrame: XRFrame, uuid: string) => {
  if (xrFrame?.session) {
    await xrFrame.session.deletePersistentAnchor?.(uuid)
  } else {
    throw new Error('XRSession not available.')
  }
}

const anchors = new Set<XRAnchor>()
const anchorPoses = new Map()

export const XRAnchorFunctions = {
  createAnchor,
  createPersistentAnchor,
  restoreAnchor,
  deleteAnchor,
  anchors,
  anchorPoses
}

const execute = () => {
  const frame = getState(XRState).xrFrame
  if (!frame) return

  const xrSpace = ReferenceSpace.origin
  if (!xrSpace) return

  if (!frame.trackedAnchors) return
  const anchorsToRemove = [] as XRAnchor[]

  for (const anchor of anchors) {
    if (!frame.trackedAnchors.has(anchor)) anchorsToRemove.push(anchor)
  }

  for (const anchor of anchorsToRemove) {
    anchors.delete(anchor)
  }

  for (const anchor of frame.trackedAnchors) {
    if (!anchors.has(anchor)) anchors.add(anchor)
  }

  for (const anchor of anchors) {
    const knownPose = anchorPoses.get(anchor)
    const anchorPose = frame.getPose(anchor.anchorSpace, xrSpace)
    if (!anchorPose) continue

    if (knownPose === undefined) {
      anchorPoses.set(anchor, anchorPose)
    } else {
      const position = anchorPose.transform.position
      const orientation = anchorPose.transform.orientation

      const knownPosition = knownPose.transform.position
      const knownOrientation = knownPose.transform.orientation

      if (
        position.x !== knownPosition.x ||
        position.y !== knownPosition.y ||
        position.z !== knownPosition.z ||
        orientation.x !== knownOrientation.x ||
        orientation.y !== knownOrientation.y ||
        orientation.z !== knownOrientation.z ||
        orientation.w !== knownOrientation.w
      ) {
        anchorPoses.set(anchor, anchorPose)
      }
    }
    // anchor pose changed
  }
}

export const XRPersistentAnchorSystem = defineSystem({
  uuid: 'ee.engine.XRPersistentAnchorSystem',
  insert: { with: XRSystem }
  // execute
})
