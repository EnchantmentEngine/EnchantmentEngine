import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { Component } from '@ir-engine/ecs'
import { ScriptComponent, VisualScriptComponent } from '@ir-engine/engine'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GrabbableComponent } from '@ir-engine/engine/src/grabbable/GrabbableComponent'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { LightmapComponent } from '@ir-engine/engine/src/lightmap/LightmapComponent'
import { AudioAnalysisComponent } from '@ir-engine/engine/src/scene/components/AudioAnalysisComponent'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@ir-engine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { LegacyVolumetricComponent } from '@ir-engine/engine/src/scene/components/LegacyVolumetricComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { LookAtComponent } from '@ir-engine/engine/src/scene/components/LookAtComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { MixerComponent } from '@ir-engine/engine/src/scene/components/MixerComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { OverlayComponent } from '@ir-engine/engine/src/scene/components/OverlayComponent'
import { ParticleSystemComponent } from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { PoiComponent } from '@ir-engine/engine/src/scene/components/PoiComponent'
import { PortalComponent } from '@ir-engine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@ir-engine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { TextComponent } from '@ir-engine/engine/src/scene/components/TextComponent'
import { TriggerCallbackComponent } from '@ir-engine/engine/src/scene/components/TriggerCallbackComponent'
import { VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { defineState, getMutableState } from '@ir-engine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { FogSettingsComponent } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { useEffect } from 'react'

export const ComponentShelfCategoriesState = defineState({
  name: 'ee.editor.ComponentShelfCategories',
  initial: () => {
    return {
      Files: [GLTFComponent, MediaComponent, VideoComponent, ImageComponent],
      'Scene Composition': [CameraComponent, PrimitiveGeometryComponent, GroundPlaneComponent, VariantComponent],
      Physics: [ColliderComponent, RigidBodyComponent, TriggerCallbackComponent],
      Interaction: [
        SpawnPointComponent,
        LinkComponent,
        MountPointComponent,
        InteractableComponent,
        InputComponent,
        OverlayComponent
      ],
      Lighting: [
        AmbientLightComponent,
        PointLightComponent,
        SpotLightComponent,
        DirectionalLightComponent,
        HemisphereLightComponent
      ],
      FX: [
        LoopAnimationComponent,
        ShadowComponent,
        ParticleSystemComponent,
        EnvMapComponent,
        PostProcessingComponent,
        MixerComponent
      ],
      Scripting: [],
      Settings: [
        SceneSettingsComponent,
        RenderSettingsComponent,
        // MediaSettingsComponent
        CameraSettingsComponent
      ],
      Visual: [
        EnvMapBakeComponent,
        ScenePreviewCameraComponent,
        SkyboxComponent,
        TextComponent,
        LookAtComponent,
        FogSettingsComponent,
        LightmapComponent
      ],
      Camera: [PoiComponent] //PoiHotspotComponent
    } as Record<string, Component[]>
  },
  reactor: () => {
    const [portalEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.Portal])
    const [grabbleEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.Grabble])
    const [splineEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.Spline])
    const [visualScriptEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.VisualScript])

    const [legacyVolumetricEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.LegacyVolumetric])
    const [volumetricEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.Volumetric])
    const [audioAnalysisEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.AudioAnalysis])
    const [screenshareTargetEnabled] = useFeatureFlags([FeatureFlags.Studio.Components.ScreenshareTarget])

    const cShelfState = getMutableState(ComponentShelfCategoriesState)

    useEffect(() => {
      if (splineEnabled) {
        cShelfState.Interaction.merge([SplineComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == SplineComponent.name))
          })
        }
      }
    }, [splineEnabled])

    useEffect(() => {
      if (portalEnabled) {
        cShelfState.Interaction.merge([PortalComponent])
        return () => {
          cShelfState.Scripting.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == ScriptComponent.name))
          })
        }
      }
    }, [portalEnabled])

    useEffect(() => {
      if (grabbleEnabled) {
        cShelfState.Interaction.merge([GrabbableComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == GrabbableComponent.name))
          })
        }
      }
    }, [grabbleEnabled])

    useEffect(() => {
      if (visualScriptEnabled) {
        cShelfState.Scripting.merge([VisualScriptComponent])
        return () => {
          cShelfState.Scripting.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == VisualScriptComponent.name))
          })
        }
      }
    }, [visualScriptEnabled])

    useEffect(() => {
      if (legacyVolumetricEnabled) {
        cShelfState.Interaction.merge([LegacyVolumetricComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == LegacyVolumetricComponent.name))
          })
        }
      }
    }, [legacyVolumetricEnabled])

    useEffect(() => {
      if (volumetricEnabled) {
        cShelfState.Interaction.merge([VolumetricComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == VolumetricComponent.name))
          })
        }
      }
    }, [volumetricEnabled])

    useEffect(() => {
      if (audioAnalysisEnabled) {
        cShelfState.Interaction.merge([AudioAnalysisComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == AudioAnalysisComponent.name))
          })
        }
      }
    }, [audioAnalysisEnabled])

    useEffect(() => {
      if (screenshareTargetEnabled) {
        cShelfState.Interaction.merge([ScreenshareTargetComponent])
        return () => {
          cShelfState.Interaction.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == ScreenshareTargetComponent.name))
          })
        }
      }
    }, [screenshareTargetEnabled])

    return null
  }
})
