import BaseController from './base.js'
import Org from '../models/org.js'

class OrgController extends BaseController {
  // 列出组织
  static async list(ctx) {
    const res = await Org.find()
    console.log(res)
    ctx.body = res
  }

  // 根据id获取组织信息
  static async get(ctx) {
    const { id } = ctx.request.body
    const res = await Org.findOne({ id })
    ctx.body = res
  }

  static async rename(ctx) {
    const { id, name, fullname, path } = ctx.request.body
    console.log(id, name, fullname, path)
    // 更新当前元素
    const updateResult = await Org.updateOne({ id }, { name, fullname })
    // 更新所有子元素的fullname
    const updateChildrenResult = await Org.updateMany({ path: new RegExp(`^${path}-`) }, [{ $set: { fullname: { $concat: [fullname, '-', '$name'] } } }])

    const res = {
      current: updateResult,
      children: updateChildrenResult
    }

    console.log(res)
    ctx.body = res
  }

  static async update(ctx) {
    console.log('update')
    const { id, ...updateData } = ctx.request.body
    const res = await Org.findOneAndUpdate({ id: id }, { $set: updateData }, { new: true, runValidators: true })
    ctx.body = res
  }
  // 添加组织
  static async add(ctx) {
    const item = ctx.request.body
    const nextId = await OrgController.getNextId('orgid')
    item.id = nextId
    item.path = item.path ? item.path + '-' + nextId : nextId
    const res = await Org.create(item)
    ctx.body = res
  }

  // 删除组织
  static async remove(ctx) {
    const { path } = ctx.request.body
    // 删除组织及其所有子组织
    const res = await Org.deleteMany({ path: new RegExp(`^${path}(-\\d+)*$`) })
    ctx.body = res
  }

  // 重新排序
  static async reorder(ctx) {
    console.log('重新排序')
    const items = ctx.request.body
    console.log(items)
    const bulkOps = items.map((item) => {
      const { id, ...updateData } = item
      console.log(id, updateData)
      return {
        updateOne: {
          filter: { id: id },
          update: { $set: updateData }
        }
      }
    })

    const res = await Org.bulkWrite(bulkOps)
    ctx.body = res
  }
}

export default OrgController
