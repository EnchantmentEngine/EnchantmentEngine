import { HookContext } from '@feathersjs/feathers'
import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@ir-engine/common/src/regex'
import fetch from 'node-fetch'

const fetchHelmVersions = async (action: 'main' | 'builder'): Promise<string[]> => {
  const regex = action === 'main' ? MAIN_CHART_REGEX : BUILDER_CHART_REGEX
  const versions: string[] = []

  const response = await fetch('https://helm.etherealengine.org')
  const chart = Buffer.from(await response.arrayBuffer()).toString()

  const matches = chart.matchAll(regex)

  for (const match of matches) {
    if (match && !versions.includes(match[1])) {
      versions.push(match[1])
    }
  }

  return versions
}

const fetchHelmVersion = async (context: HookContext) => {
  const { action } = context.params.query

  if (!action || (action !== 'main' && action !== 'builder')) {
    throw new Error(`Invalid action parameter. Expected 'main' or 'builder', received '${action}'`)
  }

  const versions = await fetchHelmVersions(action)

  context.result = versions
  return context
}

export default {
  before: {
    all: [],
    find: [fetchHelmVersion]
  },
  after: {
    all: [],
    find: []
  },
  error: {
    all: [],
    find: []
  }
}
