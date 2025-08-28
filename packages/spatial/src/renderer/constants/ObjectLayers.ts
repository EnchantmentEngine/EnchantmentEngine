import { Opaque } from '@ir-engine/hyperflux'

export type ObjectLayer = Opaque<'ObjectLayer', number>

export const ObjectLayers = {
  // anything loaded as a scene entity
  Scene: 0 as ObjectLayer,

  // intersect with camera raycast
  Camera: 1 as ObjectLayer,

  // for portal effect rendering & hiding the scene
  Portal: 2 as ObjectLayer,

  // avatars
  Avatar: 3 as ObjectLayer,

  // other gizmos (ik targets, infinite grid, origin)
  Gizmos: 4 as ObjectLayer,

  // XRUI, loading screen envmap mesh
  UI: 5 as ObjectLayer,

  // used to hide objects from studio screenshot/texture baking
  PhysicsHelper: 6 as ObjectLayer,
  AvatarHelper: 7 as ObjectLayer,
  NodeHelper: 8 as ObjectLayer,
  NodeIcon: 9 as ObjectLayer,

  // custom threejs scene in a UI panel
  Panel: 10 as ObjectLayer,

  // transform gizmo
  TransformGizmo: 11 as ObjectLayer,

  UVOL: 30 as ObjectLayer
}
export type ObjectLayerMask = Opaque<'ObjectLayerMask', number>

export const ObjectLayerMasks = {
  Scene: (1 << ObjectLayers.Scene) as ObjectLayerMask,
  Camera: (1 << ObjectLayers.Camera) as ObjectLayerMask,
  Portal: (1 << ObjectLayers.Portal) as ObjectLayerMask,
  Avatar: (1 << ObjectLayers.Avatar) as ObjectLayerMask,
  Gizmos: (1 << ObjectLayers.Gizmos) as ObjectLayerMask,
  UI: (1 << ObjectLayers.UI) as ObjectLayerMask,
  PhysicsHelper: (1 << ObjectLayers.PhysicsHelper) as ObjectLayerMask,
  AvatarHelper: (1 << ObjectLayers.AvatarHelper) as ObjectLayerMask,
  NodeHelper: (1 << ObjectLayers.NodeHelper) as ObjectLayerMask,
  NodeIcon: (1 << ObjectLayers.NodeIcon) as ObjectLayerMask,
  Panel: (1 << ObjectLayers.Panel) as ObjectLayerMask,
  TransformGizmo: (1 << ObjectLayers.TransformGizmo) as ObjectLayerMask,
  UVOL: (1 << ObjectLayers.UVOL) as ObjectLayerMask
}

/*
 * Get the layer mask for a given layer.
 * @param layer - The layer to get the mask for.
 * @returns The layer mask for the given layer, or if the layermask is not found for a given layer, returns null.
 */
export const getLayerMaskFromLayer = (layer: ObjectLayer): ObjectLayerMask | null => {
  const bitShiftedValue = 1 << layer
  return ObjectLayerMasks[ObjectLayers[bitShiftedValue]] ?? null
}
