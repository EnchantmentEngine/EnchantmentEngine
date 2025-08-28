import {
  moderationFileUploadMethods,
  moderationFileUploadPath
} from '@ir-engine/common/src/schemas/moderation/moderation-file-upload.schema'
import Multer from '@koa/multer'
import { Application } from '../../../declarations'
import { ModerationFileUploadService } from './moderation-file-upload.class'
import ModerationUploadDocs from './moderation-file-upload.docs'
import hooks from './moderation-file-upload.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [moderationFileUploadPath]: ModerationFileUploadService
  }
}
const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): void => {
  app.use(moderationFileUploadPath, new ModerationFileUploadService(app), {
    // A list of all methods this service exposes externally
    methods: moderationFileUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa: {
      before: [
        multipartMiddleware.any(),
        async (ctx, next) => {
          if (ctx?.feathers && ctx.method !== 'GET') {
            ;(ctx as any).feathers.files = (ctx as any).request.files.media
              ? (ctx as any).request.files.media
              : ctx.request.files
          }
          await next()
          return ctx.body
        }
      ]
    },
    docs: ModerationUploadDocs
  })

  const service = app.service(moderationFileUploadPath)
  service.hooks(hooks)
}
