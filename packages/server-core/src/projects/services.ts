import BuilderInfo from './builder-info/builder-info'
import ProjectBranches from './project-branches/project-branches'
import ProjectBuild from './project-build/project-build'
import ProjectBuilderTags from './project-builder-tags/project-builder-tags'
import ProjectCheckSourceDestinationMatch from './project-check-source-destination-match/project-check-source-destination-match'
import ProjectCheckUnfetchedCommit from './project-check-unfetched-commit/project-check-unfetched-commit'
import ProjectCommits from './project-commits/project-commits'
import ProjectDestinationCheck from './project-destination-check/project-destination-check'
import ProjectGithubPush from './project-github-push/project-github-push'
import ProjectHistory from './project-history/project-history'
import ProjectInvalidate from './project-invalidate/project-invalidate'
import ProjectPermission from './project-permission/project-permission'
import Project from './project/project'
import Projects from './projects/projects'

export default [
  BuilderInfo,
  Project,
  Projects,
  ProjectBuild,
  ProjectInvalidate,
  ProjectPermission,
  ProjectGithubPush,
  ProjectBuilderTags,
  ProjectBranches,
  ProjectCommits,
  ProjectDestinationCheck,
  ProjectCheckUnfetchedCommit,
  ProjectCheckSourceDestinationMatch,
  ProjectHistory
]
