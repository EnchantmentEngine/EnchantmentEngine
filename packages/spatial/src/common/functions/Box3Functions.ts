import { Box3, Quaternion, Vector3 } from 'three'

/**
 * Rotates an axis-aligned Box3 around its own center using a Quaternion,
 * and stores the resulting bounding box in `resultBox`.
 *
 * @param {Box3} box - The original Box3 (axis-aligned).
 * @param {Quaternion} quaternion - Rotation to apply to each corner.
 * @param {Vector3[]} [corners] - Working array of 8 Vector3s to store the corners of the box.
 * @param {Box3} resultBox - A Box3 that will be updated to enclose the rotated shape.
 * @returns {Box3} The `resultBox`, for chaining or direct use.
 */
export function rotateBox3AroundCenter(box: Box3, quaternion: Quaternion, corners: Vector3[], resultBox: Box3) {
  // If box is empty or invalid, just make `resultBox` empty and return early.
  if (!(box.min.x > -Infinity)) {
    resultBox.makeEmpty()
    return resultBox
  }

  // 1) Get the center of the box.
  const center = new Vector3()
  box.getCenter(center)

  // 2) Extract min/max so we can get all 8 corners of the AABB.
  const { x: xMin, y: yMin, z: zMin } = box.min
  const { x: xMax, y: yMax, z: zMax } = box.max

  // 3) List all 8 corners of the box.
  if (corners && corners.length === 8) {
    corners[0].set(xMin, yMin, zMin)
    corners[1].set(xMin, yMin, zMax)
    corners[2].set(xMin, yMax, zMin)
    corners[3].set(xMin, yMax, zMax)
    corners[4].set(xMax, yMin, zMin)
    corners[5].set(xMax, yMin, zMax)
    corners[6].set(xMax, yMax, zMin)
    corners[7].set(xMax, yMax, zMax)
  } else {
    corners = [
      new Vector3(xMin, yMin, zMin),
      new Vector3(xMin, yMin, zMax),
      new Vector3(xMin, yMax, zMin),
      new Vector3(xMin, yMax, zMax),
      new Vector3(xMax, yMin, zMin),
      new Vector3(xMax, yMin, zMax),
      new Vector3(xMax, yMax, zMin),
      new Vector3(xMax, yMax, zMax)
    ]
  }

  // 4) Clear the result box.
  resultBox.makeEmpty()

  // 5) For each corner:
  //    - Translate so the box center is at (0,0,0)
  //    - Rotate via quaternion
  //    - Then expand resultBox to include the new position
  for (let i = 0; i < corners.length; i++) {
    corners[i].sub(center) // Shift the corner so that "center" is the origin
    corners[i].applyQuaternion(quaternion) // Rotate around (0,0,0)
    resultBox.expandByPoint(corners[i]) // Expand the result box
  }

  return resultBox
}
