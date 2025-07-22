import { EngineSettingType } from '../schema.type.module'

/**
 * Determines the data type of a given value.
 *
 * @param value - The value to determine the data type of.
 * @returns The data type of the value, which can be 'string', 'boolean', or 'integer'.
 */
export const getDataType = (value: string | number | boolean): EngineSettingType['dataType'] => {
  let dataType = 'string'
  const normalizedValue = value?.toString()?.toLowerCase()
  if (normalizedValue === 'true' || normalizedValue === 'false') {
    dataType = 'boolean'
  } else if (isValidInteger(value)) {
    dataType = 'integer'
  }
  return dataType as EngineSettingType['dataType']
}

/**
 * Parses a string value based on the specified data type.
 *
 * @param value - The string value to be parsed.
 * @param dataType - The data type to which the value should be parsed.
 *                   It can be 'string', 'boolean', or 'integer'.
 * @returns The parsed value in the appropriate data type.
 */
export const parseValue = (value: string, dataType: EngineSettingType['dataType']): any =>
  dataType === 'string'
    ? value
    : dataType === 'boolean'
    ? value === 'true'
    : dataType === 'integer'
    ? Number(value)
    : value

function isValidInteger(value): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value)
  }
  if (typeof value === 'string') {
    return /^\d+$/.test(value)
  }
  return false
}
