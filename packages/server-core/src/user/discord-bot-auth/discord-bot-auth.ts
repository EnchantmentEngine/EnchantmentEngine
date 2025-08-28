import { discordBotAuthMethods, discordBotAuthPath } from '@ir-engine/common/src/schemas/user/discord-bot-auth.schema'

import { Application } from '../../../declarations'
import { DiscordBotAuthService } from './discord-bot-auth.class'
import discordBotAuthDocs from './discord-bot-auth.docs'
import hooks from './discord-bot-auth.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [discordBotAuthPath]: DiscordBotAuthService
  }
}

export default (app: Application): void => {
  app.use(discordBotAuthPath, new DiscordBotAuthService(app), {
    // A list of all methods this service exposes externally
    methods: discordBotAuthMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: discordBotAuthDocs
  })

  const service = app.service(discordBotAuthPath)
  service.hooks(hooks)
}
