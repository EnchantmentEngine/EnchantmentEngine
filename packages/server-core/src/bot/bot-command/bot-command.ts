import { botCommandMethods, botCommandPath } from '@ir-engine/common/src/schemas/bot/bot-command.schema'

import { Application } from '../../../declarations'
import { BotCommandService } from './bot-command.class'
import botCommandDocs from './bot-command.docs'
import hooks from './bot-command.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [botCommandPath]: BotCommandService
  }
}

export default (app: Application): void => {
  const options = {
    name: botCommandPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(botCommandPath, new BotCommandService(options), {
    // A list of all methods this service exposes externally
    methods: botCommandMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: botCommandDocs
  })

  const service = app.service(botCommandPath)
  service.hooks(hooks)
}
