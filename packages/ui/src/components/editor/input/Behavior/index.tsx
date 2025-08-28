import {
  ApplyForceBehaviorJSON,
  ApplySequencesJSON,
  BehaviorJSON,
  ChangeEmitDirectionBehaviorJSON,
  ColorOverLifeBehaviorJSON,
  EmitSubParticleSystemBehaviorJSON,
  FrameOverLifeBehaviorJSON,
  GravityForceBehaviorJSON,
  NoiseBehaviorJSON,
  OrbitOverLifeBehaviorJSON,
  Rotation3DOverLifeBehaviorJSON,
  RotationOverLifeBehaviorJSON,
  SizeOverLifeBehaviorJSON,
  SpeedOverLifeBehaviorJSON,
  TextureSequencerJSON,
  TurbulenceFieldBehaviorJSON,
  ValueGeneratorJSON,
  WidthOverLengthBehaviorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { getTextureAsync } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { Checkbox } from '@ir-engine/ui'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Texture, Vector2, Vector3 } from 'three'
import ColorGenerator from '../Generator/Color'
import RotationGenerator from '../Generator/Rotation'
import ValueGenerator from '../Generator/Value'
import InputGroup from '../Group'
import NumericInput from '../Numeric'
import SelectInput from '../Select'
import Vector3Input from '../Vector3'

type BehaviorInputProps = Readonly<{
  path: string
  value: BehaviorJSON
  onChange: (path: string) => (value: any) => void
}>

export default function BehaviorInput({ path, value, onChange }: BehaviorInputProps) {
  const { t } = useTranslation()

  const onChangeBehaviorType = useCallback(() => {
    const onChangeType = onChange(path + '.type')
    return (type: typeof value.type) => {
      onChangeType(type)
    }
  }, [])

  const onChangeVec3 = useCallback((path: string) => {
    const thisOnChange = onChange(path)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const applyForceInput = useCallback(
    (value: BehaviorJSON) => {
      const force = value as ApplyForceBehaviorJSON
      return (
        <>
          <InputGroup name="force" label={t('editor:properties.particle-system.behavior.force')}>
            <Vector3Input value={new Vector3(...force.direction)} onChange={onChangeVec3(path + '.direction')} />
          </InputGroup>
          <InputGroup name="magnitude" label={t('editor:properties.particle-system.behavior.magnitude')}>
            <ValueGenerator
              path={path + '.magnitude'}
              value={force.magnitude as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const noiseInput = useCallback(
    (value: BehaviorJSON) => {
      const noise = value as NoiseBehaviorJSON
      return (
        <>
          <InputGroup name="frequency" label={t('editor:properties.particle-system.behavior.frequency')}>
            <Vector3Input value={new Vector3(...noise.frequency)} onChange={onChangeVec3(path + '.frequency')} />
          </InputGroup>
          <InputGroup name="power" label={t('editor:properties.particle-system.behavior.Power')}>
            <Vector3Input value={new Vector3(...noise.power)} onChange={onChangeVec3(path + '.power')} />
          </InputGroup>
          <InputGroup name="positionAmount" label={t('editor:properties.particle-system.behavior.positionAmount')}>
            <NumericInput value={noise.positionAmount} onChange={onChange(path + '.positionAmount')} />
          </InputGroup>
          <InputGroup name="rotationAmount" label={t('editor:properties.particle-system.behavior.rotationAmount')}>
            <NumericInput value={noise.rotationAmount} onChange={onChange(path + '.rotationAmount')} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const turbulenceFieldInput = useCallback(
    (value: BehaviorJSON) => {
      const turbulence = value as TurbulenceFieldBehaviorJSON
      return (
        <>
          <InputGroup name="scale" label={t('editor:properties.particle-system.behavior.scale')}>
            <Vector3Input value={new Vector3(...turbulence.scale)} onChange={onChangeVec3(path + '.scale')} />
          </InputGroup>
          <InputGroup name="octaves" label={t('editor:properties.particle-system.behavior.octaves')}>
            <NumericInput value={turbulence.octaves} onChange={onChange(path + '.octaves')} />
          </InputGroup>
          <InputGroup
            name="velocityMultiplier"
            label={t('editor:properties.particle-system.behavior.velocityMultiplier')}
          >
            <Vector3Input
              value={new Vector3(...turbulence.velocityMultiplier)}
              onChange={onChangeVec3(path + '.velocityMultiplier')}
            />
          </InputGroup>
          <InputGroup name="timeScale" label={t('editor:properties.particle-system.behavior.timeScale')}>
            <Vector3Input value={new Vector3(...turbulence.timeScale)} onChange={onChangeVec3(path + '.timeScale')} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const gravityForceInput = useCallback(
    (value: BehaviorJSON) => {
      const gravity = value as GravityForceBehaviorJSON
      return (
        <>
          <InputGroup name="center" label={t('editor:properties.particle-system.behavior.center')}>
            <Vector3Input value={new Vector3(...gravity.center)} onChange={onChangeVec3(path + '.center')} />
          </InputGroup>
          <InputGroup name="magnitude" label={t('editor:properties.particle-system.behavior.magnitude')}>
            <NumericInput value={gravity.magnitude} onChange={onChange(path + '.magnitude')} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const colorOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const color = value as ColorOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="color" label={t('editor:properties.particle-system.behavior.color')}>
            <ColorGenerator path={path + '.color'} value={color.color} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const rotationOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const rotation = value as RotationOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="angularVelocity" label={t('editor:properties.particle-system.behavior.angularVelocity')}>
            <ValueGenerator path={path + '.angularVelocity'} value={rotation.angularVelocity} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const rotation3DOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const rotation3D = value as Rotation3DOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="angularVelocity" label={t('editor:properties.particle-system.behavior.angularVelocity')}>
            <RotationGenerator
              path={path + '.angularVelocity'}
              value={rotation3D.angularVelocity}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup name="dynamic" label={t('editor:properties.particle-system.behavior.dynamic')}>
            <Checkbox checked={rotation3D.dynamic} onChange={onChange(path + '.dynamic')} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const sizeOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const size = value as SizeOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="size" label={t('editor:properties.particle-system.behavior.size')}>
            <ValueGenerator path={path + '.size'} value={size.size} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const speedOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const speed = value as SpeedOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="speed" label={t('editor:properties.particle-system.behavior.speed')}>
            <ValueGenerator path={path + '.speed'} value={speed.speed} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const frameOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const frame = value as FrameOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="frame" label={t('editor:properties.particle-system.behavior.frame')}>
            <ValueGenerator path={path + '.frame'} value={frame.frame} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const orbitOverLifeInput = useCallback(
    (value: BehaviorJSON) => {
      const orbit = value as OrbitOverLifeBehaviorJSON
      return (
        <>
          <InputGroup name="orbit" label={t('editor:properties.particle-system.behavior.orbit')}>
            <ValueGenerator path={path + '.orbitSpeed'} value={orbit.orbitSpeed} onChange={onChange} />
          </InputGroup>
          <InputGroup name="axis" label={t('editor:properties.particle-system.behavior.axis')}>
            <Vector3Input value={new Vector3(...orbit.axis)} onChange={onChangeVec3(path + '.axis')} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const widthOverLength = useCallback(
    (value: BehaviorJSON) => {
      const width = value as WidthOverLengthBehaviorJSON
      return (
        <>
          <InputGroup name="width" label={t('editor:properties.particle-system.behavior.width')}>
            <ValueGenerator path={path + '.width'} value={width.width} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const changeEmitDirectionInput = useCallback(
    (value: BehaviorJSON) => {
      const changeEmitDirection = value as ChangeEmitDirectionBehaviorJSON
      return (
        <>
          <InputGroup name="angle" label={t('editor:properties.particle-system.behavior.angle')}>
            <ValueGenerator path={path + '.angle'} value={changeEmitDirection.angle} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const emitSubParticleSystemInput = useCallback(
    (value: BehaviorJSON) => {
      const emitSubParticleSystem = value as EmitSubParticleSystemBehaviorJSON
      return (
        <>
          <InputGroup
            name="subParticleSystem"
            label={t('editor:properties.particle-system.behavior.subParticleSystem')}
          >
            <></>
            {/*  @todo */}
            {/* <SceneObjectInput
              value={emitSubParticleSystem.subParticleSystem}
              onChange={onChange(emitSubParticleSystem.subParticleSystem)}
            /> */}
          </InputGroup>
        </>
      )
    },
    [value]
  )

  const onChangeSequenceTexture = useCallback(
    (value: TextureSequencerJSON) => {
      const thisOnChange = onChange(path + '.src')
      return (src: string) => {
        getTextureAsync(src).then(([texture]) => {
          if (!texture) return
          createReadableTexture(texture, { canvas: true, flipY: true }).then((readableTexture: Texture) => {
            const canvas = readableTexture.image as HTMLCanvasElement
            const ctx = canvas.getContext('2d')!
            const width = canvas.width
            const height = canvas.height
            const imageData = ctx.getImageData(0, 0, width, height)
            const locations: Vector2[] = []
            const threshold = value.threshold
            for (let i = 0; i < imageData.height; i++) {
              for (let j = 0; j < imageData.width; j++) {
                imageData.data[(i * imageData.width + j) * 4 + 3] > threshold &&
                  locations.push(new Vector2(j, imageData.height - i))
              }
            }
            canvas.remove()
            value.locations = locations
          })
        })
        thisOnChange(src)
      }
    },
    [value]
  )

  const onAddTextureSequencer = useCallback(() => {
    const sequencers = value as ApplySequencesJSON
    const thisOnChange = onChange(path + '.sequencers')
    return () => {
      const nuSequencer = {
        range: { a: 0, b: 1 },
        sequencer: {
          scaleX: 1,
          scaleY: 1,
          position: [0, 0, 0],
          src: '',
          locations: [],
          threshold: 0.5
        }
      }
      const nuSequencers = [...JSON.parse(JSON.stringify(sequencers.sequencers)), nuSequencer]
      thisOnChange(nuSequencers)
    }
  }, [value])

  // const applySequencesInput = useCallback(
  //   (value: BehaviorJSON) => {
  //     const applySequences = value as ApplySequencesJSON
  //     const value = applySequences.value
  //     return (
  //       <>
  //         <NumericInputGroup
  //           name="Delay"
  //           label="Delay"
  //           value={value.delay}
  //           onChange={onChange(applySequences.delay)}
  //         />
  //         <Button onClick={onAddTextureSequencer()}>Add Texture Sequencer</Button>
  //         <PaginatedList
  //           list={applySequences.sequencers}
  //           element={(sequencer: {range: IntervalValueJSON; sequencer: SequencerJSON }>) => {
  //             const sequencer = sequencer.value
  //             return (
  //               <>
  //                 <NumericInputGroup
  //                   name="Start"
  //                   label="Start"
  //                   value={sequencer.range.a}
  //                   onChange={onChange(sequencer.range.a)}
  //                 />
  //                 <NumericInputGroup
  //                   name="End"
  //                   label="End"
  //                   value={sequencer.range.b}
  //                   onChange={onChange(sequencer.range.b)}
  //                 />
  //                 <NumericInputGroup
  //                   name="Scale X"
  //                   label="Scale X"
  //                   value={sequencer.sequencer.scaleX}
  //                   onChange={onChange(sequencer.sequencer.scaleX)}
  //                 />
  //                 <NumericInputGroup
  //                   name="Scale Y"
  //                   label="Scale Y"
  //                   value={sequencer.sequencer.scaleY}
  //                   onChange={onChange(sequencer.sequencer.scaleY)}
  //                 />
  //                 <InputGroup name="Position" label="Position">
  //                   <Vector3Input
  //                     value={sequencer.sequencer.position}
  //                     onChange={onChangeVec3(sequencer.sequencer.position)}
  //                   />
  //                 </InputGroup>
  //                 <InputGroup name="Texture" label="Texture">
  //                   <TexturePreviewInput
  //                     value={sequencer.sequencer.src}
  //                     onRelease={onChangeSequenceTexture(sequencer.sequencer)}
  //                   />
  //                 </InputGroup>
  //               </>
  //             )
  //           }}
  //         />
  //       </>
  //     )
  //   },
  //   [value]
  // )

  const inputs = {
    ApplyForce: applyForceInput,
    Noise: noiseInput,
    TurbulenceField: turbulenceFieldInput,
    GravityForce: gravityForceInput,
    ColorOverLife: colorOverLifeInput,
    RotationOverLife: rotationOverLifeInput,
    SizeOverLife: sizeOverLifeInput,
    SpeedOverLife: speedOverLifeInput,
    FrameOverLife: frameOverLifeInput,
    OrbitOverLife: orbitOverLifeInput,
    Rotation3DOverLife: rotation3DOverLifeInput,
    WidthOverLength: widthOverLength,
    ChangeEmitDirection: changeEmitDirectionInput,
    EmitSubParticleSystem: emitSubParticleSystemInput
  }

  return (
    <>
      <InputGroup name="type" label={t('editor:properties.particle-system.behavior.type')}>
        <SelectInput
          value={value.type}
          options={[
            { label: t('editor:properties.particle-system.behavior.applyForce'), value: 'ApplyForce' },
            { label: t('editor:properties.particle-system.behavior.noise'), value: 'Noise' },
            { label: t('editor:properties.particle-system.behavior.turbulenceField'), value: 'TurbulenceField' },
            { label: t('editor:properties.particle-system.behavior.gravity'), value: 'GravityForce' },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Color' }),
              value: 'ColorOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Rotation' }),
              value: 'RotationOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Rotation3D' }),
              value: 'Rotation3DOverLife'
            },
            { label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Size' }), value: 'SizeOverLife' },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Speed' }),
              value: 'SpeedOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Frame' }),
              value: 'FrameOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Color' }),
              value: 'OrbitOverLife'
            },
            { label: t('editor:properties.particle-system.behavior.widthOverLength'), value: 'WidthOverLength' },
            {
              label: t('editor:properties.particle-system.behavior.changeEmitDirection'),
              value: 'ChangeEmitDirection'
            },
            {
              label: t('editor:properties.particle-system.behavior.emitSubParticleSystem'),
              value: 'EmitSubParticleSystem'
            }
          ]}
          onChange={onChangeBehaviorType()}
        />
      </InputGroup>
      {inputs[value.type](value)}
    </>
  )
}
