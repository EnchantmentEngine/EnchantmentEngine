import type { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/IR_thumbnail.jpg',
  routes: {
    '/': {
      component: () => import('@ir-engine/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@ir-engine/client/src/pages/admin')
    },
    '/location': {
      component: () => import('@ir-engine/client/src/pages/location/location')
    },
    '/banned': {
      component: () => import('@ir-engine/client/src/pages/_banned')
    },
    '/studio': {
      component: () => import('@ir-engine/client/src/pages/editor')
    },
    '/capture': {
      component: () => import('@ir-engine/client/src/pages/capture')
    },
    '/chat': {
      component: () => import('@ir-engine/client/src/pages/chat/chat')
    }
  }
}

export default config
