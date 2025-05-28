/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { Application } from '@feathersjs/koa'

import { logger } from '../ServerLogger'

/**
 * P2P Metrics Service for tracking metrics in P2P mode
 */
export class P2PMetricsService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Track P2P metrics
   * @param data - The metrics data
   */
  async create(data: { instanceId: string; locationId?: string }) {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return { success: true }

    try {
      const metricsService = this.app.get('metricsService')
      if (metricsService) {
        metricsService.trackP2PMetrics(data.instanceId, data.locationId)
      }
      return { success: true }
    } catch (error) {
      logger.error('Error tracking P2P metrics', error)
      return { success: false, error: error.message }
    }
  }
}

/**
 * Configure P2P metrics endpoint
 */
export default (options = {}) => {
  return (app: Application): void => {
    // Check if metrics are enabled via environment variable
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') {
      logger.info('P2P metrics are disabled via environment configuration')
      return
    }

    app.use('p2p-metrics', new P2PMetricsService(app))

    logger.info('P2P metrics endpoint available at: /p2p-metrics')
  }
}
