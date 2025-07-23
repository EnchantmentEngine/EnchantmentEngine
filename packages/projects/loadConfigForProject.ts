import type { ProjectConfigInterface } from './ProjectConfigInterface'

const configs = {} as Record<string, ProjectConfigInterface>

export const loadConfigForProject = async (project: string): Promise<ProjectConfigInterface | null> => {
  try {
    if (configs[project]) return configs[project]
    const [orgname, projectName] = project.split('/')
    const projectConfig = (await import(`./projects/${orgname}/${projectName}/xrengine.config.ts`))
      .default as ProjectConfigInterface
    configs[project] = projectConfig
    return projectConfig
  } catch (e) {
    console.log(`Failed to import config for project ${project} with reason ${e}`)
    return null!
  }
}
