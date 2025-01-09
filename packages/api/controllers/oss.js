import * as Minio from 'minio'
import BaseController from './base.js'
import qs from 'qs'
import crypto from 'crypto'
import { optimize } from 'svgo'
import Icon from '../models/icon.js'
import { nanoid } from 'nanoid'

const minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: process.env.OSS_ACCESS_KEY,
  secretKey: process.env.OSS_SECRET_KEY
})

class OSSController extends BaseController {
  static async initNewMultipartUpload(ctx) {
    const headers = {
      'Content-Type': 'application/octet-stream'
    }
    let { filename } = ctx.request.body
    const uuid = crypto.randomUUID({ disableEntropyCache: true })
    const ext = filename.match(/\.([0-9a-z]+)$/i)?.[1] || ''
    const prefix = `${uuid.substring(0, 2)}/${uuid.substring(2, 4)}/${uuid.substring(4, 6)}`
    const newFilename = `${prefix}/${uuid}.${ext}`

    let oldTags
    filename = decodeURIComponent(filename)
    let uploadId
    console.log('====initNewMultipartUpload====')
    try {
      const previousUploadId = await minioClient.findUploadId('mpadmin', newFilename)
      console.log('- previousUploadId', previousUploadId)
      if (!previousUploadId) {
        uploadId = await minioClient.initiateNewMultipartUpload('mpadmin', newFilename, headers)
      } else {
        console.log('**get oldTags**')
        uploadId = previousUploadId
        oldTags = await minioClient.listParts('mpadmin', newFilename, previousUploadId)
        console.log('oldTags:', oldTags)
      }

      console.log('- uploadId:', uploadId)
      ctx.body = { uploadId, newFilename, oldTags }
    } catch (err) {
      console.log(err)
    }
  }

  static async uploadPart(ctx) {
    const chunk = ctx.request.file
    let { filename, uploadId, partNumber } = ctx.request.body
    filename = decodeURIComponent(filename)

    console.log('====uploadPart====')
    console.log('- filename:', filename)
    console.log('- uploadId:', uploadId)
    console.log('- partNumber:', partNumber)

    const options = {
      method: 'PUT',
      query: qs.stringify({
        partNumber: parseInt(partNumber),
        uploadId
      }),
      bucketName: 'mpadmin',
      objectName: filename
    }
    const response = await minioClient.makeRequestAsyncOmit(options, chunk.buffer)
    console.log('- etag', response.headers.etag)
    let etag = response.headers.etag
    if (etag) {
      etag = etag.replace(/^"/, '').replace(/"$/, '')
    } else {
      etag = ''
    }
    ctx.body = { etag: etag, part: parseInt(partNumber) }
  }

  static async completeMultipartUpload(ctx) {
    let { filename, uploadId, etags } = ctx.request.body
    filename = decodeURIComponent(filename)
    const etagsJson = JSON.parse(etags)
    console.log('====completeMultipartUpload====')
    const result = await minioClient.completeMultipartUpload('mpadmin', filename, uploadId, etagsJson)

    ctx.body = result
  }

  static async svgIconUpload(ctx) {
    const { file } = ctx.request
    const uuid = nanoid(10)
    const newFilename = `${uuid}.svg`

    // 读取上传的 SVG 内容
    const svgContent = file.buffer.toString('utf8').replace(/(fill|stroke)="([^"]+)"/g, (match, attr) => {
      // 保留 none 值，其他颜色值都替换为 currentColor
      if (match.includes('"none"') || !match.includes('#000000')) {
        return match
      }
      return `${attr}="currentColor"`
    })

    // 使用 SVGO 优化
    const optimized = optimize(svgContent, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false
            }
          }
        },
        'cleanupIds',
        {
          name: 'removeAttrs',
          params: {
            attrs: ['class', 'data-name']
          }
        }
      ]
    })

    // 使用 Minio 的 putObject 进行简单上传
    await minioClient.putObject('svgicon', newFilename, optimized.data, {
      'Content-Type': 'image/svg+xml'
    })
    ctx.body = {
      filename: newFilename
    }
  }

  static async addSvgIcon(ctx) {
    console.log('====addSvgIcon====')
    const { name, path } = ctx.request.body
    const res = await Icon.create({ name, path })
    ctx.body = res
  }

  static async svgIconList(ctx) {
    const { page, limit, keyword = '' } = ctx.request.body

    // 构建查询条件
    const query = keyword ? { name: { $regex: keyword, $options: 'i' } } : {}

    const [total, data] = await Promise.all([
      Icon.countDocuments(query),
      Icon.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 })
    ])
    ctx.body = {
      data,
      total: total
    }
    console.log(ctx.body)
  }

  static async removeSvgIcon(ctx) {
    const { path } = ctx.request.body
    const res = await Icon.deleteOne({ path: path })
    ctx.body = res
  }
}
export default OSSController
