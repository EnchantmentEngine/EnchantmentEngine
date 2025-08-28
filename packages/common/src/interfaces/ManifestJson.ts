export type ManifestJson = {
  name: string
  /**
   * The version of this project
   * @example "0.0.1"
   */
  version: string
  /**
   * The version of the engine this project version is compatible with.
   * @example "1.0.0"
   */
  engineVersion: string
  /**
   * A short description of the project
   * @example "A simple project"
   */
  description?: string
  repoEmpty?: boolean
  /**
   * An optional thumbnail image
   * @example "https://example.com/thumbnail.jpg"
   */
  thumbnail?: string
  /**
   * The dependencies of this project. Specify other projects that are to be installed alongside this one.
   * Can be either a string in the format 'namespace/project-name' or an object with detailed configuration.
   * @example ["orgname/reponame", { "name": "orgname/another-repo", "commitHash": "abc123", "branch": "main" }]
   * The solo string or name can also be in the format `git+<url>.git
   */
  dependencies?: (
    | string
    | {
        name: string
        commit?: string
        tag?: string
        branch?: string
      }
  )[]
}
