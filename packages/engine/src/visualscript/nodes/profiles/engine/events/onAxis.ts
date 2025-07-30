import {
  defineQuery,
  defineSystem,
  destroySystem,
  getComponent,
  InputSystemGroup,
  Query,
  removeQuery,
  SystemUUID
} from '@ir-engine/ecs'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { StandardGamepadAxes, XRStandardGamepadAxes } from '@ir-engine/spatial/src/input/state/ButtonState'
import { Choices, makeEventNodeDefinition, NodeCategory } from '@ir-engine/visual-script'

let systemCounter = 0

type State = {
  query: Query
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

// very 3D specific.
export const OnAxis = makeEventNodeDefinition({
  typeName: 'engine/axis/use',
  category: NodeCategory.Engine,
  label: 'Use Axis',
  in: {
    axis: (_, graphApi) => {
      const choices: Choices = [
        ...Object.keys(StandardGamepadAxes)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `gamepad/${value}`, value })),
        ...Object.keys(XRStandardGamepadAxes)
          .filter((x) => !(parseInt(x) >= 0))
          .sort()
          .map((value) => ({ text: `xr-gamepad/${value}`, value }))
      ]
      return {
        valueType: 'integer',
        choices: choices,
        defaultValue: choices[0].value
      }
    },
    deadzone: 'float'
  },
  out: {
    flow: 'flow',
    entity: 'entity',
    value: 'float'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph }) => {
    const axisKey = read<number>('axis')
    const deadzone = read<number>('deadzone')

    const query = defineQuery([InputSourceComponent])
    const systemUUID = defineSystem({
      uuid: 'visual-script-onAxis-' + systemCounter++,
      insert: { with: InputSystemGroup },
      execute: () => {
        for (const eid of query()) {
          const inputSource = getComponent(eid, InputSourceComponent)
          if (!inputSource.source.gamepad) continue
          let gamepadAxesValue = inputSource.source.gamepad?.axes[axisKey]
          if (Math.abs(gamepadAxesValue) < deadzone) gamepadAxesValue = 0
          write('value', eid)
          write('value', gamepadAxesValue)
          commit('flow')
        }
      }
    })

    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID }, graph: { getDependency } }) => {
    destroySystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
