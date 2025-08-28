import ApiJob from './api-job/api-job'
import BuildStatus from './build-status/build-status'
import LogsApi from './logs-api/logs-api'
import MigrationsInfo from './migrations-info/migrations-info'
import Pods from './pods/pods'

export default [LogsApi, BuildStatus, Pods, MigrationsInfo, ApiJob]
