// Initializes the `login` service on path `/login`
import { loginMethods, loginPath } from '@ir-engine/common/src/schemas/user/login.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { LoginService } from './login.class'
import loginDocs from './login.docs'
import hooks from './login.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [loginPath]: LoginService
  }
}

async function redirect(ctx, next) {
  try {
    const data = ctx.body

    let redirectQuery = ''
    let redirectPath = ''
    let originPath = config.client.url

    if (ctx.query?.redirectUrl) {
      redirectQuery = `&path=${ctx.query.redirectUrl}`
      redirectPath = ctx.query.redirectUrl
      originPath = new URL(ctx.query.redirectUrl).origin
    }

    if (data.error) return ctx.redirect(`${redirectPath || originPath}/?error=${data.error as string}`)
    if (data.promptForConnection) {
      return ctx.redirect(
        `${originPath}/auth/magiclink?loginId=${data.loginId}&loginToken=${
          data.loginToken as string
        }&promptForConnection=true&associateEmail=${data.associateEmail}${redirectQuery}`
      )
    } else return ctx.redirect(`${originPath}/auth/magiclink?type=login&token=${data.token as string}${redirectQuery}`)
  } catch (err) {
    logger.error(err)
    throw err
  }
  return next()
}

export default (app: Application): void => {
  app.use(loginPath, new LoginService(app), {
    // A list of all methods this service exposes externally
    methods: loginMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: loginDocs,
    koa: { after: [redirect] }
  })

  const service = app.service(loginPath)
  service.hooks(hooks)
}
