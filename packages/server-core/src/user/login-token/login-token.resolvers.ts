// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import crypto from 'crypto'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

import { LoginTokenQuery, LoginTokenType } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { fromDateTimeSql, getDateTimeSql, toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'

export const loginTokenResolver = resolve<LoginTokenType, HookContext>({
  expiresAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.expiresAt)),
  createdAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.createdAt)),
  updatedAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.updatedAt))
})

export const loginTokenExternalResolver = resolve<LoginTokenType, HookContext>({})

export const loginTokenDataResolver = resolve<LoginTokenType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  token: async () => {
    return crypto.randomBytes(config.authentication.bearerToken.numBytes).toString('hex')
  },
  expiresAt: async (value, message, context) => {
    return context.data.expiresAt ? context.data.expiresAt : toDateTimeSql(moment().utc().add(10, 'minutes').toDate())
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const loginTokenPatchResolver = resolve<LoginTokenType, HookContext>({
  updatedAt: getDateTimeSql
})

export const loginTokenQueryResolver = resolve<LoginTokenQuery, HookContext>({})
