import BaseController from './base.js'
import Resource from '../models/resource.js'

class ResourceController extends BaseController {
  static async get(ctx) {
    const { id, locale } = ctx.request.body
    let resource
    if (locale) {
      resource = await Resource.findOne({ id: id }).i18n(locale)
    } else {
      resource = await Resource.findOne({ id: id })
    }
    ctx.body = resource
  }
  static async list(ctx) {
    // console.log('aaaa')
    const { pid, isOneLevel } = ctx.request.body
    let resource
    if (isOneLevel) {
      resource = await Resource.find({ pid: pid }).i18n(ctx.headers.locale)
    } else if (pid == null) {
      resource = await Resource.find().i18n(ctx.headers.locale)
    } else {
      const regex = new RegExp(`^${pid}-`)
      resource = await Resource.find({ $or: [{ path: regex }, { id: pid }] }).i18n(ctx.headers.locale)
      // console.log('resources', resource)
      // console.log(resource)
      // resource = await Resource.find({ path: regex })
    }
    ctx.body = resource
  }
  static async add(ctx) {
    const item = ctx.request.body
    const nextId = await ResourceController.getNextId('resourceid')
    item.id = nextId
    item.path = item.path ? item.path + '-' + nextId : nextId
    const resource = await Resource.create(item)
    ctx.body = resource
    console.log(resource)
  }

  static async update(ctx) {
    const item = ctx.request.body
    console.log('update', item)
    const res = await Resource.replaceOne({ id: item.id }, item)
    ctx.body = res
    // console.log(res)
  }

  static async reorder(ctx) {
    // console.log('reorder')
    const req = ctx.request.body
    const data = req.map((id, index) => {
      return {
        updateOne: {
          filter: { id: id },
          update: { order: index + 1 }
        }
      }
    })
    const res = await Resource.bulkWrite(data)
    // const data = req.map((id, index) => {
    //   return { filter: { id: id }, update: { order: index + 1 } }
    // })
    // console.log(data)

    // const res = Resource.updateMany(
    //   data.map(({ filter, update }) => {
    //     return { filter, update }
    //   }),
    //   { multi: true }
    // )

    ctx.body = res
  }

  static async remove(ctx) {
    const { path } = ctx.request.body
    // 创建一个正则表达式来匹配所有需要删除的资源ID及其子角色

    // 使用 $or 操作符来匹配所有符合条件的文档
    const res = await Resource.deleteMany({ path: new RegExp(`^${path}(-\\d+)*$`) })
    ctx.body = res
  }

  // 获取菜单列表
  static async getMenu(ctx) {
    // 调试：打印原始查询结果
    const resources = await Resource.find({ type: 1, isHidden: false }).select('id name pid path linkType link router order iconType icon target').i18n(ctx.headers.locale)

    // console.log('原始查询结果：', JSON.stringify(resources[0], null, 2))
    // console.log('resources', resources)
    ctx.body = resources
  }
}

export default ResourceController
