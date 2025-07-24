import { defineState, getMutableState } from '@ir-engine/hyperflux'
import { SVGIconType } from '@ir-engine/ui/src/icons/types'
import { IconType } from 'react-icons'

type ExternalMenuType = {
  component: React.ReactNode
  title: string
  icon: SVGIconType | IconType
}

export const ViewerMenuState = defineState({
  name: 'ViewerMenuState',
  initial: () => ({
    userMenus: {
      profile: true,
      settings: false,
      readyplayer: true,
      avaturn: true,
      avatarselect: false,
      avatarmodify: false,
      share: false,
      emote: true,
      friends: false,
      social: true,
      embedframe: true
    } as Record<string, boolean>,
    externalInjectedMenus: {} as Record<string, ExternalMenuType>
  }),
  addExternalMenu: (params: { name: string; icon: React.ElementType | JSX.Element; component: React.ReactNode }) => {
    getMutableState(ViewerMenuState).externalInjectedMenus.merge({
      [params.name]: { component: params.component, icon: params.icon }
    } as Record<string, ExternalMenuType>)
  }
})
