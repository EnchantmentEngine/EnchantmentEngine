import appRootPath from 'app-root-path'
import fs from 'fs'
import type { Knex } from 'knex'
import sortBy from 'lodash/sortBy'
import path from 'path'

import appConfig from '@ir-engine/server-core/src/appconfig'

const migrationsDirectories: string[] = []

const parseDirectory = (directoryPath: string) => {
  const directoryContent = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && !dir.name.endsWith('-vector'))
  for (const directory of directoryContent) {
    const subFolder = path.join(directoryPath, directory.name)
    if (directory.name === 'migrations') {
      migrationsDirectories.push(subFolder)
    } else {
      parseDirectory(subFolder)
    }
  }
}

const currentDirectory = process.cwd()
const currentFolderName = path.basename(path.resolve(process.cwd())) // https://stackoverflow.com/a/53295230/2077741

let serverCoreSrc = '../server-core/src'

if (currentFolderName === 'server-core') {
  serverCoreSrc = './src'
} else if (currentDirectory.includes('projects/projects')) {
  serverCoreSrc = '../../../../server-core/src'
} else {
  serverCoreSrc = path.join(appRootPath.path, '/packages/server-core/src')
}

parseDirectory(serverCoreSrc)

const projectsDirectory = path.join(appRootPath.path, '/packages/projects/projects')
const projectsExists = fs.existsSync(projectsDirectory)

if (projectsExists) {
  parseDirectory(projectsDirectory)
}

function getFile(migrationsInfo) {
  const absoluteDir = path.resolve(process.cwd(), migrationsInfo.directory)
  const _path = path.join(absoluteDir, migrationsInfo.file)
  return import(_path)
}

function filterMigrations(migrationSource, migrations, loadExtensions) {
  return migrations.filter((migration) => {
    const migrationName = migrationSource.getMigrationName(migration)
    const extension = path.extname(migrationName)
    return loadExtensions.includes(extension)
  })
}

const sortDirsSeparately = false
const loadExtensions = ['.ts']

const config: Knex.Config = {
  client: 'mysql',
  connection: {
    user: appConfig.db.username,
    password: appConfig.db.password,
    host: appConfig.db.host,
    port: parseInt(appConfig.db.port),
    database: appConfig.db.database,
    charset: 'utf8mb4',
    multipleStatements: true
  },
  migrations: {
    migrationSource: {
      /** taken and modified from default knex importer to work with { "type": "module" } specified in package.json */
      getMigrations() {
        // Get a list of files in all specified migration directories
        const readMigrationsPromises = migrationsDirectories.map((configDir) => {
          const absoluteDir = path.resolve(process.cwd(), configDir)
          return fs.promises.readdir(absoluteDir).then((files) => ({
            files,
            configDir,
            absoluteDir
          }))
        })

        return Promise.all(readMigrationsPromises).then((allMigrations) => {
          const migrations = allMigrations.reduce(
            (acc, migrationDirectory) => {
              // When true, files inside the folder should be sorted
              if (sortDirsSeparately) {
                migrationDirectory.files = migrationDirectory.files.sort()
              }

              migrationDirectory.files.forEach((file) => acc.push({ file, directory: migrationDirectory.configDir }))

              return acc
            },
            [] as { file: string; directory: string }[]
          )

          // If true we have already sorted the migrations inside the folders
          // return the migrations fully qualified
          if (sortDirsSeparately) {
            return filterMigrations(this, migrations, loadExtensions)
          }

          return filterMigrations(this, sortBy(migrations, 'file'), loadExtensions)
        })
      },

      getMigrationName(migration: any) {
        return migration.file
      },

      getMigration(migrationInfo) {
        return getFile(migrationInfo)
      }
    },
    tableName: 'knex_migrations',
    stub: 'migration.stub',
    extension: 'ts',
    disableMigrationsListValidation: true
  },
  pool: {
    min: 5,
    max: 30
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

export default config
