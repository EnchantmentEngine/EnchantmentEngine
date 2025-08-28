import { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SceneComplexity, SceneComplexityWeights } from '@ir-engine/engine/src/scene/constants/SceneConstants'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { useChildrenWithComponents } from '@ir-engine/ecs'

import { RenderInfoState, SceneComplexityParams } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { useTranslation } from 'react-i18next'
import { EditorState } from '../services/EditorServices'

function calculateSceneComplexity(params: SceneComplexityParams): number {
  const complexity =
    SceneComplexityWeights.verticesWeight * params.vertices +
    SceneComplexityWeights.trianglesWeight * params.triangles +
    SceneComplexityWeights.texturesMBWeight * params.texturesMB +
    SceneComplexityWeights.lightsWeight * params.lights +
    SceneComplexityWeights.drawCallsWeight * params.drawCalls +
    SceneComplexityWeights.shaderComplexityWeight * params.shaderComplexity

  return complexity
}

export const RenderMonitorSystem = defineSystem({
  uuid: 'ee.editor.RenderMonitorSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const { t } = useTranslation()

    const renderInfoState = useHookstate(getMutableState(RenderInfoState))
    const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
    const lightQuery = useChildrenWithComponents(rootEntity, [LightTagComponent, VisibleComponent])
    const [sceneComplexityNotif] = useFeatureFlags([FeatureFlags.Studio.UI.SceneComplexityNotification])
    const prevSceneComplexity = useHookstate(0)

    useEffect(() => {
      const params = {
        // Change this back to the resource state once the GLTF loader refactor is done
        vertices: renderInfoState.info.triangles.value,
        triangles: renderInfoState.info.triangles.value,
        texturesMB: renderInfoState.info.texturesMB.value,
        drawCalls: renderInfoState.info.calls.value,
        shaderComplexity: renderInfoState.info.shaderComplexity.value,
        lights: lightQuery.length
      }

      renderInfoState.info.sceneComplexity.set(calculateSceneComplexity(params))
    }, [
      renderInfoState.info.triangles.value,
      renderInfoState.info.texturesMB.value,
      renderInfoState.info.calls.value,
      renderInfoState.info.shaderComplexity.value,
      lightQuery
    ])

    useEffect(() => {
      if (!sceneComplexityNotif) return

      // these thresholds are to be adjusted  based on experimentation
      const sceneComplexity = renderInfoState.info.sceneComplexity.value
      if (
        sceneComplexity < SceneComplexity.VeryLight.value ||
        sceneComplexity < SceneComplexity.Light.value ||
        sceneComplexity < SceneComplexity.Medium.value ||
        sceneComplexity < SceneComplexity.Heavy.value
      ) {
        prevSceneComplexity.set(sceneComplexity)
        return
      }

      const prevValue = prevSceneComplexity.value

      let warningThreshold: number = SceneComplexity.VeryHeavy.value
      if (prevValue < warningThreshold && sceneComplexity >= warningThreshold) {
        const warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.VeryHeavy.label })
        NotificationService.dispatchNotify(warning, { variant: 'warning' })
      }

      warningThreshold = SceneComplexity.Heavy.value
      if (prevValue < warningThreshold && sceneComplexity >= warningThreshold) {
        const warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.Heavy.label })
        NotificationService.dispatchNotify(warning, { variant: 'warning' })
      }

      prevSceneComplexity.set(sceneComplexity)
    }, [renderInfoState.info.sceneComplexity.value])

    return null
  }
})
