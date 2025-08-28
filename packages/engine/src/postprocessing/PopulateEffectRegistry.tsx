import { PresentationSystemGroup } from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { useEffect } from 'react'
import { bloomAddToEffectRegistry } from './BloomEffect'
import { brightnessContrastAddToEffectRegistry } from './BrightnessContrastEffect'
import { chromaticAberrationAddToEffectRegistry } from './ChromaticAberrationEffect'
import { colorAverageAddToEffectRegistry } from './ColorAverageEffect'
import { colorDepthAddToEffectRegistry } from './ColorDepthEffect'
import { depthOfFieldAddToEffectRegistry } from './DepthOfFieldEffect'
import { dotScreenAddToEffectRegistry } from './DotScreenEffect'
import { fxaaAddToEffectRegistry } from './FXAAEffect'
import { glitchAddToEffectRegistry } from './GlitchEffect'
import { gridAddToEffectRegistry } from './GridEffect'
import { hueSaturationAddToEffectRegistry } from './HueSaturationEffect'
import { lut1DAddToEffectRegistry } from './LUT1DEffect'
import { lut3DAddToEffectRegistry } from './LUT3DEffect'
import { lensDistortionAddToEffectRegistry } from './LensDistortionEffect'
import { linearTosRGBAddToEffectRegistry } from './LinearTosRGBEffect'
// import { motionBlurAddToEffectRegistry } from './MotionBlurEffect'
import { noiseAddToEffectRegistry } from './NoiseEffect'
import { pixelationAddToEffectRegistry } from './PixelationEffect'
import { smaaAddToEffectRegistry } from './SMAAEffect'
import { ssaoAddToEffectRegistry } from './SSAOEffect'
import { scanlineAddToEffectRegistry } from './ScanlineEffect'
// import { traaAddToEffectRegistry } from './TRAAEffect'
import { tiltShiftAddToEffectRegistry } from './TiltShiftEffect'
import { toneMappingAddToEffectRegistry } from './ToneMappingEffect'
import { vignetteAddToEffectRegistry } from './VignetteEffect'

export const populateEffectRegistry = () => {
  // registers the effects
  bloomAddToEffectRegistry()
  brightnessContrastAddToEffectRegistry()
  chromaticAberrationAddToEffectRegistry()
  colorAverageAddToEffectRegistry()
  colorDepthAddToEffectRegistry()
  depthOfFieldAddToEffectRegistry()
  dotScreenAddToEffectRegistry()
  fxaaAddToEffectRegistry()
  glitchAddToEffectRegistry()
  //GodRaysEffect
  gridAddToEffectRegistry()
  hueSaturationAddToEffectRegistry()
  lensDistortionAddToEffectRegistry()
  linearTosRGBAddToEffectRegistry()
  lut1DAddToEffectRegistry() //could use better user-messaging
  lut3DAddToEffectRegistry() //could use better user-messaging
  // motionBlurAddToEffectRegistry() // realism-effect
  noiseAddToEffectRegistry()
  pixelationAddToEffectRegistry()
  scanlineAddToEffectRegistry()
  // shockWaveAddToEffectRegistry()
  smaaAddToEffectRegistry()
  ssaoAddToEffectRegistry()
  // ssrAddToEffectRegistry() // realism-effect - issue = no visual change
  // ssgiAddToEffectRegistry() // realism-effect - issue = no visual change
  // textureAddToEffectRegistry() // issue = engine freezes when assigning texture
  tiltShiftAddToEffectRegistry()
  toneMappingAddToEffectRegistry()
  //traaAddToEffectRegistry() // realism-effect - issue = crashing and freezing
  vignetteAddToEffectRegistry()
}

export const PostProcessingRegisterSystem = defineSystem({
  uuid: 'ee.engine.PostProcessingRegisterSystem',
  insert: { before: PresentationSystemGroup },
  reactor: () => {
    useEffect(() => populateEffectRegistry(), [])
    return null
  }
})
