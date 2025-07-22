/**
 * Method used to get all leaf node strings from an object.
 * https://stackoverflow.com/a/63100031/2077741
 * @param obj
 * @returns
 */
export function getAllStringValueNodes(obj: any) {
  if (typeof obj === 'string') {
    return [obj]
  }

  // handle wrong types and null
  if (typeof obj !== 'object' || !obj) {
    return []
  }

  return Object.keys(obj).reduce((acc, key) => {
    return [...acc, ...getAllStringValueNodes(obj[key])]
  }, [])
}
