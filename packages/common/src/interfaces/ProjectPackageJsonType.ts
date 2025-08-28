import { IPackageJson } from 'package-json-type'

export const DefaultUpdateSchedule = '0 * * * *'

/** @deprecated use package-json-type directly */
export interface ProjectPackageJsonType extends IPackageJson {}
