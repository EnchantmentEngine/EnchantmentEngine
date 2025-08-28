import { botMethods, botPath } from '@ir-engine/common/src/schemas/bot/bot.schema'

import { Application } from '../../../declarations'
import { BotService } from './bot.class'
import botDocs from './bot.docs'
import hooks from './bot.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [botPath]: BotService
  }
}

export default (app: Application): void => {
  const options = {
    name: botPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(botPath, new BotService(options), {
    // A list of all methods this service exposes externally
    methods: botMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: botDocs
  })

  const service = app.service(botPath)
  service.hooks(hooks)
}
