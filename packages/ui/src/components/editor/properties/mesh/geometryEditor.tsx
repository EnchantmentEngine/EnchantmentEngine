import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute } from 'three'

import { useHookstate } from '@ir-engine/hyperflux'
import { HiTrash } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import Label from '../../../../primitives/tailwind/Label'
import Text from '../../../../primitives/tailwind/Text'

const recalculateNormals = (geometry: BufferGeometry) => {
  geometry.computeVertexNormals()
}

export default function GeometryEditor({ geometry }: { ['geometry']: BufferGeometry | null }) {
  if (!geometry) return null

  const { t } = useTranslation()

  const updateGeo = useHookstate(0)

  const updateGeoData = useCallback(
    () => ({
      uuid: geometry.uuid,
      name: geometry.name,
      attributes: Object.entries(geometry.attributes).map(([attribName, attrib]) => ({
        name: attribName,
        count: attrib.count,
        itemSize: attrib.itemSize,
        normalized: (attrib as BufferAttribute | InterleavedBufferAttribute).normalized
      }))
    }),
    [updateGeo]
  )

  const geoData = useHookstate(updateGeoData())
  useEffect(() => {
    geoData.set(updateGeoData())
  }, [updateGeo])

  const deleteBufferAttribute = (attribName: string) => {
    geometry.deleteAttribute(attribName)
    updateGeo.set(updateGeo.get() + 1)
  }

  return (
    <div className="my-2 flex flex-col gap-2">
      <Button variant="primary" fullWidth onClick={() => recalculateNormals(geometry)}>
        {t('editor:properties.mesh.geometry.recalculateNormals')}
      </Button>
      {geoData.attributes.map((attribute, idx) => (
        <div className="relative flex flex-col border border-gray-500 px-3 py-2" key={attribute.name.value + idx}>
          <Button
            variant="tertiary"
            className="absolute right-0 top-1 "
            onClick={() => deleteBufferAttribute(attribute.name.value)}
          >
            <HiTrash />
          </Button>
          {['name', 'count', 'itemSize'].map((property) => (
            <div className="flex items-center gap-2" key={property}>
              <Label>{t(`editor:properties.mesh.geometry.${property}`)}</Label>
              <Text>{attribute[property].value}</Text>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
