import Multer from '@koa/multer'

import { ffmpegMethod, ffmpegPath } from '@ir-engine/common/src/schemas/media/ffmpeg.schema'

import { Application } from '../../../declarations'
import { FfmpegService } from './ffmpeg.class'
import ffmpegDocs from './ffmpeg.docs'
import hooks from './ffmpeg.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [ffmpegPath]: FfmpegService
  }
}

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): void => {
  app.use(ffmpegPath, new FfmpegService(app), {
    // A list of all methods this service exposes externally
    methods: ffmpegMethod,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: ffmpegDocs,
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

  const service = app.service(ffmpegPath)
  service.hooks(hooks)
}
