import React from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { createErrorBoundary } from '@ir-engine/hyperflux'
import { clientContextParams } from '../../util/ClientContextState'

const logger = multiLogger.child({ component: 'client-core:system-crash', modifier: clientContextParams })

const ClientErrorBoundary = createErrorBoundary(
  function error(props, error?: Error) {
    if (error) {
      return (
        <div className="error-screen">
          <h2 style={{ fontSize: '100%', fontWeight: 'normal' }}>An error has occured</h2>
          <h4 style={{ fontSize: '100%', fontWeight: 'normal' }}>{error.message}</h4>
        </div>
      )
    } else {
      return <React.Fragment>{props.children}</React.Fragment>
    }
  },
  (error) => logger.error(error)
)

export default ClientErrorBoundary
