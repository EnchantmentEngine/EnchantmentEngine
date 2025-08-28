import { HookContext } from '@feathersjs/feathers'
import { resolve } from '@feathersjs/schema'
import { getValidator, Static, Type } from '@feathersjs/typebox'
import { BigQuery } from '@google-cloud/bigquery'
import { dataValidator } from '@ir-engine/common/src/schemas/validators'

export const AnalyticsLogSchema = Type.Object(
  {
    // Required Log Properties Payload
    event_id: Type.String(),
    event_name: Type.String(),
    // Optional Properties
    action: Type.Optional(Type.String()),
    level: Type.Optional(Type.String()),
    component: Type.Optional(Type.String()),
    user_id: Type.Optional(Type.String()),
    event_value: Type.Optional(Type.String()),
    event_properties: Type.Optional(
      Type.Array(
        Type.Object({
          key: Type.String(),
          value: Type.String()
        })
      )
    ),
    session_id: Type.Optional(Type.String()),
    environment: Type.Optional(Type.String()),
    host_uri: Type.Optional(Type.String()),
    app_name: Type.Optional(Type.String()),
    ip_address: Type.Optional(Type.String()),
    device_type: Type.Optional(Type.String()),
    device_info: Type.Optional(Type.String()),
    account_id: Type.Optional(Type.String()),
    location_id: Type.Optional(Type.String()),
    project_id: Type.Optional(Type.String()),
    tenant: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    event_time: Type.Optional(Type.Number())
  },
  { additionalProperties: false }
)

export const BQLogSchema = Type.Pick(
  AnalyticsLogSchema,
  [
    'user_id',
    'event_name',
    'event_id',
    'event_value',
    'event_properties',
    'session_id',
    'environment',
    'host_uri',
    'app_name',
    'ip_address',
    'device_type',
    'device_info',
    'account_id',
    'location_id',
    'project_id',
    'tenant',
    'project',
    'event_time'
  ],
  { additionalProperties: false }
)

export type AnalyticsLog = Static<typeof AnalyticsLogSchema>
export type BQLog = Static<typeof BQLogSchema>

export const AnalyticsLogValidator = getValidator(AnalyticsLogSchema, dataValidator)
export const AnalyticsLogResolver = resolve<AnalyticsLog, HookContext>({
  user_id: async (value, log, context) => context.params.user.id,
  event_time: async (value, log) => value || Date.now(),
  action: async () => undefined,
  level: async () => undefined,
  component: async () => undefined
})

export const BQLogValidator = getValidator(BQLogSchema, dataValidator)

// Ensure the environment variables exist (or add runtime checks as needed)
const projectId: string = process.env.BQ_PROJECT_ID!
const datasetId: string = process.env.BQ_DATASET_ID!
const tableId: string = process.env.BQ_TABLE_ID!

// Initialize the BigQuery client
const bigquery = new BigQuery({
  projectId
})

/**
 * Logs an event to BigQuery.
 *
 * @param event - The event object containing the event data.
 */
export const logToBigQuery = async (log: BQLog) => {
  try {
    // Retrieve the dataset and table from BigQuery.
    const dataset = bigquery.dataset(datasetId)
    const table = dataset.table(tableId)
    // Insert the row.
    const result = await table.insert(log)
    console.log('[BigQuery] event:', log)
    console.log('[BigQuery] result:', result)
  } catch (error) {
    console.error('Error inserting row into BigQuery:', error)
    throw error
  }
}
