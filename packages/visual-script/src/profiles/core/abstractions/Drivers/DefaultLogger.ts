/* eslint-disable class-methods-use-this */
import { Logger } from '../../../../VisualScriptModule'
import { ILogger, LogSeverity } from '../ILogger'

export class DefaultLogger implements ILogger {
  log(severity: LogSeverity, text: string): void {
    Logger.log(severity, text)
  }
}
