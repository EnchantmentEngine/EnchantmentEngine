import { Params } from '@feathersjs/feathers'
import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'

import ffmpegStatic from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Application } from '../../../declarations'

import { BadRequest } from '@feathersjs/errors'
import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
ffmpeg.setFfmpegPath(ffmpegStatic)

const FFMPEG_TIMEOUT = 30 * 1000 // 30 seconds

async function convertGifToMp4(fileBuffer: Buffer): Promise<Buffer | null> {
  const isGif = fileBuffer.slice(0, 3).toString('ascii') === 'GIF'
  if (!isGif) return null

  const tmpInput = path.join(os.tmpdir(), `input-${Date.now()}.gif`)
  const tmpOutput = path.join(os.tmpdir(), `output-${Date.now()}.mp4`)

  await fs.writeFile(tmpInput, new Uint8Array(fileBuffer))

  return new Promise((resolve, reject) => {
    const timeoutMs = FFMPEG_TIMEOUT
    let timedOut = false

    const ffmpegProc = ffmpeg(tmpInput)
      .format('mp4')
      .videoCodec('libx264')
      .outputOptions([
        '-r 15',
        '-g 1',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-profile:v baseline',
        '-level 3.0',
        '-preset fast'
      ])
      .on('error', (err) => {
        if (!timedOut) {
          reject(new Error(`FFmpeg error: ${err.message}`))
        }
      })
      .on('end', async () => {
        if (timedOut) return
        try {
          const result = await fs.readFile(tmpOutput)
          await fs.unlink(tmpInput)
          await fs.unlink(tmpOutput)
          resolve(result)
        } catch (err) {
          reject(new Error(`Failed to read output: ${err.message}`))
        }
      })
      .save(tmpOutput)

    const timeout = setTimeout(() => {
      timedOut = true
      ffmpegProc.kill('SIGKILL')
      reject(new Error(`FFmpeg timed out after ${timeoutMs / 1000}s`))
    }, timeoutMs)
  })
}

export interface FfmpegParams extends Params {
  files: UploadFile[]
}

/**
 * A class for FFMPEG service convert gif to mp4
 * @param {Application} app - The application instance
 */
export class FfmpegService implements ServiceInterface<string[], any, FfmpegParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(rawData: { args: string }, params: FfmpegParams) {
    if (!params.files || !Array.isArray(params.files)) {
      throw new BadRequest('No files provided or invalid files format')
    }

    let data: any[]
    try {
      data = typeof rawData.args === 'string' ? JSON.parse(rawData.args) : rawData.args
    } catch (error) {
      throw new BadRequest('Invalid arguments format')
    }

    const result = await Promise.all(
      params.files.map(async (file, i) => {
        if (!file.buffer) {
          throw new BadRequest(`File at index ${i} has no buffer`)
        }

        const args = data[i]
        if (!args) {
          throw new BadRequest(`No arguments provided for file at index ${i}`)
        }

        let fileBuffer = file.buffer as Buffer
        let contentType = args.contentType || file.mimetype
        let path = args.path

        if (contentType === 'image/gif') {
          try {
            const convertedBuffer = await convertGifToMp4(fileBuffer)
            if (convertedBuffer) {
              fileBuffer = convertedBuffer
              contentType = 'video/mp4'
              path = path.replace(/\.gif$/i, '.mp4')

              return await this.app.service(fileBrowserPath).patch(null, {
                ...args,
                project: args.project,
                path: path,
                body: fileBuffer,
                contentType: contentType
              })
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            throw new BadRequest(`GIF conversion failed for ${path}: ${errorMessage}`)
          }
        }
        return null
      })
    )

    const urls = result.map((result) => result?.url).filter((url): url is string => url !== undefined)

    // Clear params
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return urls
  }
}
