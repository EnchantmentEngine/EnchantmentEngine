import React, { useEffect } from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import ClickawayListener from '../ClickawayListener'

const PopupMenu = () => {
  const popups = useMutableState(ModalState).modals

  const currentOnClose = useHookstate<{
    callback: VoidFunction | null
  }>({
    callback: null
  })

  useEffect(() => {
    if (popups.length > 0) {
      currentOnClose.set({
        callback: popups[popups.length - 1].get(NO_PROXY).onClickOutside
      })
    }
  }, [popups])

  if (popups.length === 0) {
    return null
  }

  return (
    <ClickawayListener onClickOutside={currentOnClose.get(NO_PROXY).callback}>
      {popups.get(NO_PROXY).map((popupData, idx) => (
        <React.Fragment key={idx}>{popupData.element}</React.Fragment>
      ))}
    </ClickawayListener>
  )
}
PopupMenu.displayName = 'PopupMenu'

PopupMenu.defaultProps = {}

export default PopupMenu
