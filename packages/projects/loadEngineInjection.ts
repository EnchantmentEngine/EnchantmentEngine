import { loadConfigForProject } from './loadConfigForProject'

export const loadEngineInjection = async (projects: string[]) => {
  return Promise.all(
    projects.map(async (project) => {
      try {
        const projectConfig = (await loadConfigForProject(project))!
        if (typeof projectConfig.worldInjection !== 'function') return null!
        return (await projectConfig.worldInjection()).default?.()
      } catch (e) {
        console.error(`Failed to import world load event for project ${project} with reason ${e}`)
        return null!
      }
    })
  )
}
