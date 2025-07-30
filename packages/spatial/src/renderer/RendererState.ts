import { Entity } from '@ir-engine/ecs/src/Entity'
import {defineState, syncStateWithLocalStorage} from '@ir-engine/hyperflux'

import { isIPhone } from '../common/functions/isMobile'
import { RenderBackends, RenderBackendsType, RenderModes, RenderModesType } from './constants/RenderModes'

export const RendererState = defineState({
  name: 'RendererState',
  initial: () => ({
    qualityLevel: isIPhone ? 2 : 5, // range from 0 to 5
    automatic: isIPhone ? false : true,
    // usePBR: true,
    usePostProcessing: isIPhone ? false : true,
    useShadows: isIPhone ? false : true,
    /** Resoulion scale. **Default** value is 1. */
    renderScale: 1,
    physicsDebug: false,
    bvhDebug: false,
    avatarDebug: false,
    renderMode: RenderModes.SHADOW as RenderModesType,
    nodeHelperVisibility: false,
    nodeIconVisibility: true,
    gridVisibility: false,
    gridHeight: 0,
    forceBasicMaterials: false,
    shadowMapResolution: isIPhone ? 256 : 1024,
    infiniteGridHelperEntity: null as Entity | null,
    backend: RenderBackends.WEBGL as RenderBackendsType
  }),
  extension: syncStateWithLocalStorage([
    'qualityLevel',
    'automatic',
    // 'usePBR',
    'usePostProcessing',
    'useShadows',
    'physicsDebug',
    'bvhDebug',
    'avatarDebug',
    'renderMode',
    'nodeHelperVisibility',
    'nodeIconVisibility'
  ])
})
