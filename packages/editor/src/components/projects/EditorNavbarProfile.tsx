import React from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import ProfileMenu from '@ir-engine/client-core/src/user/menus/ProfileMenu'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { MdPerson } from 'react-icons/md'

export const EditorNavbarProfile = () => {
  const name = useHookstate(getMutableState(AuthState).user.name)

  const handleClick = () => {
    ModalState.openModal(<ProfileMenu />)
  }

  return (
    <>
      <button onClick={handleClick} className="flex items-center gap-1 font-medium text-white">
        <span>{name.value}</span>
        <MdPerson className="text-2xl" />
      </button>
    </>
  )
}
