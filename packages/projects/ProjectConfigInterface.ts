import { OembedType, ProjectType } from '@ir-engine/common/src/schema.type.module'
import type { Application } from '@ir-engine/server-core/declarations'

export interface ProjectConfigInterface {
  /**
   * See ProjectEventHooks
   */
  onEvent?: string

  /**
   * URL path to thumbnail
   */
  thumbnail?: string

  /**
   * Custom Routes
   * Loaded by the client to enable custom front end webapp routes
   * JSX component and props are loaded into the react router on the front end
   * The key of the object represents the route in the format '/myroute'
   */
  routes?: {
    [route: string]: {
      component: () => Promise<{ default: (props: any) => JSX.Element }>
      props?: {
        [x: string]: any
        exact?: boolean
      }
      componentProps?: {
        [x: string]: any
      }
    }
  }

  /**
   * Webapp Injection
   * This is loaded on ALL pages if enabled
   * Allows for loading of site-wide state and other globals
   */
  webappInjection?: () => Promise<{ default: (props: any) => void | JSX.Element }>

  /**
   * World Injection
   * This is loaded on ALL instances of the engine if enabled
   * Allows for running of custom logic regardless of which scene or route is loaded
   */
  worldInjection?: () => Promise<{ default?: () => Promise<void> } | any>
  /**
   * Services
   * Adds custom services to the backend, as well as enabling arbitrary injection into the backend
   * @returns {Array<InstallFunctionType>}
   */
  services?: string

  /**
   * Adds configurations to the database seeder
   * @returns {Array<KnexSeed>}
   */
  databaseSeed?: string
}

type InstallFunctionType = (app: Application, project: ProjectType) => Promise<any>
type OEmbedFunctionType = (
  app: Application,
  project: ProjectType,
  url: URL,
  currentOEmbed: OembedType
) => Promise<OembedType | null>

/**
 *
 */
export interface ProjectEventHooks {
  /**
   * Runs when a project is installed.
   * In local, the next time `npm run dev` is run.
   * In k8s, the next time the builder is run, OR immediately after the project is updated.
   */
  onInstall?: InstallFunctionType
  /** Runs every time a project is updated in a deployment OR when the builder runs */
  onUpdate?: InstallFunctionType
  /** Runs when a project is uninstalled */
  onUninstall?: InstallFunctionType
  /**
   * get oEmbed for active routes that match URL
   * return that project's onOEmbedRequest()
   * if null, return default
   */
  onOEmbedRequest?: OEmbedFunctionType
}

export type ProjectEventHookType = keyof ProjectEventHooks

/**
 * Systems imported from a scene MUST have their filename end with `System.ts` and be in the `/src/systems` folder.
 * This is to optimize vite's code-splitting bundling process, as each potentially dynamically
 * importable file will result in a new bundle with it's own copy of all of it's import dependencies.
 */
