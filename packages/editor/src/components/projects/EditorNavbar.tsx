import React from 'react'

import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'

import { useFind } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { EditorNavbarProfile } from './EditorNavbarProfile'
import styles from './styles.module.scss'

export const EditorNavbar = () => {
  const clientSettingQuery = useFind(engineSettingPath, {
    query: {
      category: 'client',
      key: EngineSettings.Client.AppTitle,
      paginate: false
    }
  })

  const clientSetting = clientSettingQuery.data[0]

  const routeHome = () => {
    RouterState.navigate('/')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div
          className={styles.logoBlock}
          style={{ backgroundImage: `url(${clientSetting?.value})` }}
          onClick={routeHome}
        ></div>
        <EditorNavbarProfile />
      </div>
    </nav>
  )
}
