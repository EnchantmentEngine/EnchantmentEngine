import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

export const ScreenshareTargetComponent = defineComponent({
  name: 'ScreenshareTargetComponent',
  jsonID: 'EE_screenshare_target',
  toJSON: () => true
})
