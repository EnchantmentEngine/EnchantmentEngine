import { Entity, getComponent, hasComponent } from '@ir-engine/ecs'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { StandardGamepadAxes, XRStandardGamepadAxes } from '@ir-engine/spatial/src/input/state/ButtonState'
import { Assert, Choices, NodeCategory, makeFunctionNodeDefinition } from '@ir-engine/visual-script'

// very 3D specific.
export const getAxis = makeFunctionNodeDefinition({
  typeName: 'engine/axis/get',
  category: NodeCategory.Engine,
  label: 'get Axis',
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
    deadzone: 'float',
    entity: 'entity'
  },
  out: {
    value: 'float'
  },
  exec: ({ read, write, graph }) => {
    const axisKey = read<number>('axis')
    const deadzone = read<number>('deadzone')
    const entity = Number(read('entity')) as Entity
    Assert.mustBeTrue(hasComponent(entity, InputSourceComponent), 'ERROR: entity does not have Input Source component')
    const inputSource = getComponent(entity, InputSourceComponent)
    Assert.mustBeDefined(inputSource.source.gamepad, 'ERROR: InputSourceComponent does not have gamepad')
    let gamepadAxesValue = inputSource.source.gamepad?.axes[axisKey]
    if (Math.abs(gamepadAxesValue!) < deadzone) gamepadAxesValue = 0
    write('value', gamepadAxesValue)
  }
})
