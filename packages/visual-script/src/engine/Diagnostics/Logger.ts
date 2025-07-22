/* eslint-disable no-console */

import { LogSeverity } from '../../profiles/ProfilesModule'
import { EventEmitter } from '../Events/EventEmitter'

export const LogLevel = {
  Verbose: 0,
  Info: 1,
  Warning: 2,
  Error: 3
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]

export function logSeverityToLevel(severity: LogSeverity) {
  switch (severity) {
    case 'verbose':
      return LogLevel.Verbose
    case 'info':
      return LogLevel.Info
    case 'warning':
      return LogLevel.Warning
    case 'error':
      return LogLevel.Error
  }
}
export const PrefixStyle = {
  None: 0,
  Default: 1,
  Time: 2
} as const

export type PrefixStyle = (typeof PrefixStyle)[keyof typeof PrefixStyle]

const Reset = '\x1b[0m'
const FgRed = '\x1b[31m'
const BgYellow = '\x1b[43m'
const Dim = '\x1b[2m'

export type LogMessage = { severity: LogSeverity; text: string }

export class Logger {
  static logLevel = LogLevel.Info
  static prefixStyle: number = 1 // PrefixStyle.Default

  public static readonly onLog = new EventEmitter<LogMessage>()

  static {
    const prefix = (): string => {
      const prefixStyle = Logger.prefixStyle
      if (prefixStyle === 0) {
        // PrefixStyle.None
        return ''
      } else if (prefixStyle === 1) {
        // PrefixStyle.Default
        return '[ee Visual Script]:'
      } else if (prefixStyle === 2) {
        // PrefixStyle.Time
        return new Date().toLocaleTimeString().padStart(11, '0') + ' '
      }
      return ''
    }

    Logger.onLog.addListener((logMessage: LogMessage) => {
      if (Logger.logLevel > logSeverityToLevel(logMessage.severity)) return // verbose if for in graph only

      const level = logSeverityToLevel(logMessage.severity)
      if (level === LogLevel.Info) {
        console.info(prefix() + logMessage.text)
      } else if (level === LogLevel.Warning) {
        console.warn(prefix() + logMessage.text)
      } else if (level === LogLevel.Error) {
        console.error(prefix() + logMessage.text)
      }
    })
  }

  static log(severity: LogSeverity, text: string) {
    this.onLog.emit({ severity, text })
  }

  static verbose(text: string) {
    this.onLog.emit({ severity: 'verbose', text })
  }

  static info(text: string) {
    this.onLog.emit({ severity: 'info', text })
  }

  static warning(text: string) {
    this.onLog.emit({ severity: 'warning', text })
  }

  static error(text: string) {
    this.onLog.emit({ severity: 'error', text })
  }
}
