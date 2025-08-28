import { KernelSize, Resolution } from 'postprocessing'
import { Texture } from 'three'

import { defineState } from '@ir-engine/hyperflux'

import { BlendFunction } from './effects/blending/BlendFunction'

export const HighlightState = defineState({
  name: 'HighlightState',
  initial: {
    blendFunction: BlendFunction.SCREEN,
    patternTexture: null! as Texture, // post processing args typed as (Texture | undefined) so we must override the type
    patternScale: 60.0,
    edgeStrength: 5.0,
    pulseSpeed: 0.0,
    visibleEdgeColor: 0xffffff,
    hiddenEdgeColor: 0xffffff,
    kernelSize: KernelSize.MEDIUM,
    blur: true,
    xRay: true,
    multisampling: 0,
    resolutionScale: 0.5,
    resolutionX: Resolution.AUTO_SIZE,
    resolutionY: Resolution.AUTO_SIZE,
    width: Resolution.AUTO_SIZE,
    height: Resolution.AUTO_SIZE
  }
})
