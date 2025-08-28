import { describe, expect, it } from 'vitest'
import { getDataType, parseValue } from '../../src/utils/dataTypeUtils'

describe('getDataType', () => {
  it('should return "string" for string values', () => {
    expect(getDataType('string value')).toBe('string')
    expect(getDataType('abc123')).toBe('string')
  })

  it('should return "boolean" for boolean values', () => {
    expect(getDataType(true)).toBe('boolean')
    expect(getDataType(false)).toBe('boolean')
    expect(getDataType('true')).toBe('boolean')
    expect(getDataType('false')).toBe('boolean')
  })

  it('should return "integer" for integer values', () => {
    expect(getDataType(123)).toBe('integer')
    expect(getDataType('123')).toBe('integer')
  })
})

describe('parseValue', () => {
  it('should parse string values correctly', () => {
    expect(parseValue('hello', 'string')).toBe('hello')
    expect(parseValue('123', 'string')).toBe('123')
  })

  it('should parse boolean values correctly', () => {
    expect(parseValue('true', 'boolean')).toBe(true)
    expect(parseValue('false', 'boolean')).toBe(false)
  })

  it('should parse integer values correctly', () => {
    expect(parseValue('123', 'integer')).toBe(123)
    expect(parseValue('0', 'integer')).toBe(0)
  })

  it('should return the original value for unknown data types', () => {
    expect(parseValue('hello', 'unknown' as any)).toBe('hello')
  })
})
