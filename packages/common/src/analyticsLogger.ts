import { BigQuery } from '@google-cloud/bigquery'
import { v4 as uuidv4 } from 'uuid'
import { LogParamsObject } from './logger'

interface BigQueryRow {
  event_name: string
  event_id: string
  event_value: string
  event_properties: any
  event_time: number
  tenant: string
  project: string
  user_id: string
  session_id: string
  environment: string
  host_uri: string
  app_name: string
  ip_address: string
  device_type: string
  device_info: string
}

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
export const logToBigQuery = async (event: LogParamsObject) => {
  // Create the row to insert into BigQuery.
  const row: BigQueryRow = {
    event_name: event.event_name,
    event_id: event.event_id || uuidv4(),
    event_value: event.event_value || '',
    event_properties: event.event_properties || {},
    event_time: Date.now(),
    tenant: event.tenant,
    project: event.project,
    user_id: event.user_id,
    session_id: event.session_id,
    environment: event.environment,
    host_uri: event.host_uri,
    app_name: event.app_name,
    ip_address: event.ip_address,
    device_type: event.device_type,
    device_info: event.device_info
  }

  try {
    // Retrieve the dataset and table from BigQuery.
    const dataset = bigquery.dataset(datasetId)
    const table = dataset.table(tableId)

    // Insert the row.
    await table.insert(row)
    console.log(`Logged event to BigQuery: ${event.event_name}`)
  } catch (error) {
    console.error('Error inserting row into BigQuery:', error)
  }
}
