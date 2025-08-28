import { AnimatePresence, motion, Variant } from 'motion/react'
import React from 'react'

// Import main screen components
import AccountSettings from './AccountSettings'
import GraphicsSettings from './GraphicsSettings'
import MainMenu from './MainMenu'

// Import other screen components
import { NavigateFuncProps, useNavigationProvider } from '../Glass/NavigationProvider'
import AudioScreen from './AudioScreen'
import AvatarScreen from './AvatarScreen'
import ControlsScreen from './ControlsScreen'
import DisplayNameScreen from './DisplayNameScreen'
import LoginScreen from './LoginScreen'
import ShareSpaceScreen from './ShareSpaceScreen'
import SignUpScreen from './SignUpScreen'
import SSOScreen from './SSOScreen'

// Import icons from the icons module
// Define types for screen components
type ScreenProps = NavigateFuncProps

// Define screen structure type
interface ScreenDefinition {
  component: React.ComponentType<ScreenProps>
  title: string
}

// Define all screens
export const screens: Record<string, ScreenDefinition> = {
  main: { component: MainMenu, title: 'Settings' },
  account: { component: AccountSettings, title: 'Account' },
  graphics: { component: GraphicsSettings, title: 'Graphics' },
  audio: { component: AudioScreen, title: 'Audio' },
  login: {
    title: 'Sign In',
    component: LoginScreen
  },
  signup: {
    title: 'Sign Up',
    component: SignUpScreen
  },
  share: {
    component: ShareSpaceScreen,
    title: 'Share Space'
  },
  avatar: {
    component: AvatarScreen,
    title: 'Avatar'
  },
  controls: {
    component: ControlsScreen,
    title: 'Controls'
  },
  display: {
    component: DisplayNameScreen,
    title: 'Display Name'
  },
  sso: {
    component: SSOScreen,
    title: 'Single Sign On'
  }
}

interface SettingsMenuProps {
  onClose?: () => void
  initScreen?: string
}

const SettingsMenu = ({ initScreen = 'main' }: SettingsMenuProps) => {
  const { current, direction, second, navigateTo, navigateClose } = useNavigationProvider()

  const ActiveComponent = screens[second || initScreen].component

  // Animation variants for slide transitions
  const variants: Record<string, Variant> = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  return (
    <div data-testid="settings-menu-backdrop" id="settings-menu-backdrop" className="h-full w-full">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.2 },
            opacity: { duration: 0.2 }
          }}
          className={`
                scrollbar-hide
                h-full
              `}
        >
          <ActiveComponent navigateTo={navigateTo} navigateClose={navigateClose} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SettingsMenu
