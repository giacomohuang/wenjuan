import BaseController from './base.js'
import Wenjuan from '../models/wenjuan/wenjuan.js'
import Version from '../models/wenjuan/version.js'
import CustomError from '../CustomError.js'

class WenjuanController extends BaseController {
  static async list(ctx) {
    const { page = 1, limit = 10, keywords, teamId, sort = { updatedAt: -1 } } = ctx.request.body
    const currentAccountId = ctx.request.headers['accountid']
    // console.log('list params:', { page, limit, query, sort })

    const query = {}
    if (keywords) {
      query.name = { $regex: keywords, $options: 'i' }
    }
    query.team = teamId
    console.log('currentAccountId', currentAccountId)
    if (currentAccountId) {
      query.owner = currentAccountId
    } else {
      throw new CustomError(401, '未登录', 50100)
    }
    console.log('query', query)
    const wenjuan = await Wenjuan.find(query, { updatedAt: 1 })
      .select('isPublish name draft.name updatedAt')
      .populate('operator', 'accountname realname avatar')
      // .populate('team', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    const total = await Wenjuan.countDocuments(query)
    ctx.body = {
      wenjuan,
      total: total,
      pages: Math.ceil(total / limit),
      page: page,
      limit: limit
    }
    console.log('wenjuan', wenjuan)
  }

  static async get(ctx) {
    console.log('get')
    const { id } = ctx.request.body
    const res = await Wenjuan.findOne({ _id: id })
    ctx.body = res
    console.log(res)
  }

  static async getVersion(ctx) {
    const { id, version } = ctx.request.body
    const res = await Version.findOne({ wenjuanId: id, version: version })
    ctx.body = res
    console.log(res)
  }

  static async getVersionList(ctx) {
    const { id, page = 1, limit = 10 } = ctx.request.body

    const res = await Version.find({ wenjuanId: id })
      .select('version operator createdAt')
      .sort({ version: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    const total = await Version.countDocuments({ wenjuanId: id })
    ctx.body = {
      list: res,
      total: total,
      pages: Math.ceil(total / limit),
      page: page,
      limit: limit
    }
  }

  static async update(ctx) {
    const { _id, ...updateData } = ctx.request.body
    const accountId = ctx.request.headers['accountid']
    // 添加 updatedAt 字段
    updateData.updatedAt = new Date()

    let res
    // 如果没有 _id，创建新数据
    if (!_id) {
      updateData.operator = accountId
      updateData.owner = accountId
      const newWenjuan = new Wenjuan(updateData)
      res = await newWenjuan.save()
    }
    // 如果有 _id，更新已存在的数据
    else {
      // 如果传入的参数有isPublish, 执行发布操作，则同时创建wenjuanVersion记录
      if (updateData.isPublish) {
        try {
          res = await Wenjuan.findOneAndUpdate({ _id: _id }, { $set: updateData, $inc: { version: 1 } }, { new: true, runValidators: true }).select('version')
          // 创建新版本
          const newVersion = new Version({
            wenjuanId: _id,
            version: res.version,
            name: updateData.name,
            settings: updateData.settings,
            data: updateData.data,
            operator: accountId
          })
          await newVersion.save()
        } catch (error) {
          throw error
        }
      }
      // 如果传入的参数没有isPublish, 则只更新数据（草稿）
      else {
        console.log('updateData:', updateData)
        res = await Wenjuan.findOneAndUpdate({ _id: _id }, { $set: updateData }, { new: true, runValidators: true })
      }
    }
    ctx.body = res
    console.log(res)
  }

  // 删除问卷
  static async remove(ctx) {
    console.log('remove')
    const ids = ctx.request.body
    // console.log(ids)
    // 删除问卷及其所有子问卷
    const res = await Wenjuan.deleteMany({ _id: { $in: ids } })
    ctx.body = res
  }
}

export default WenjuanController
