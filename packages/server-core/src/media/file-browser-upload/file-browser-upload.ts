import Multer from '@koa/multer'

import {
  fileBrowserUploadMethods,
  fileBrowserUploadPath
} from '@ir-engine/common/src/schemas/media/file-browser-upload.schema'

import { Application } from '../../../declarations'
import { FileBrowserUploadService } from './file-browser-upload.class'
import fileBrowserUploadDocs from './file-browser-upload.docs'
import hooks from './file-browser-upload.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [fileBrowserUploadPath]: FileBrowserUploadService
  }
}

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): void => {
  app.use(fileBrowserUploadPath, new FileBrowserUploadService(app), {
    // A list of all methods this service exposes externally
    methods: fileBrowserUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: fileBrowserUploadDocs,
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
    }
  })

  const service = app.service(fileBrowserUploadPath)
  service.hooks(hooks)
}
