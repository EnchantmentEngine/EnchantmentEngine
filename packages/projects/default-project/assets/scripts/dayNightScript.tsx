
import { AnimationSystemGroup, defineQuery, defineSystem, ECSState, getComponent, setComponent } from '@ir-engine/ecs'
import { SkyboxComponent, SkyTypeEnum } from '@ir-engine/engine'
import { getState } from '@ir-engine/hyperflux'

const skyboxs = defineQuery([SkyboxComponent])

setComponent(skyboxs()[0], SkyboxComponent, { backgroundType: SkyTypeEnum.skybox })

const execute = (): void => {
  for (const skybox of skyboxs()) {
    const value = (getState(ECSState).elapsedSeconds % 24) / 24
    const props = getComponent(skybox, SkyboxComponent).skyboxProps
    setComponent(skybox, SkyboxComponent, { skyboxProps: { ...props, azimuth: value } })
  }
}

export const scriptDayNightCycleSystem = defineSystem({
  uuid: 'ee.editor.scriptDayNightCycleSystem',
  insert: { before: AnimationSystemGroup },
  execute
})
