import BaseController from './base.js'
import Role from '../models/role.js'

class RoleController extends BaseController {
  static async get(ctx) {
    const { id } = ctx.request.body
    const res = await Role.findOne({ id: id })
    ctx.body = res
  }
  static async list(ctx) {
    const { pid } = ctx.request.body
    let res
    if (pid == null) {
      res = await Role.find().i18n(ctx.headers.locale)
    } else {
      const regex = new RegExp(`^${pid}-`)
      res = await Role.find({ $or: [{ path: regex }, { id: pid }] })
    }
    ctx.body = res
  }

  static async add(ctx) {
    const item = ctx.request.body
    const nextId = await RoleController.getNextId('roleid')
    item.id = nextId
    item.path = item.path ? item.path + '-' + nextId : nextId
    const res = await Role.create(item)
    ctx.body = res
    console.log(res)
  }

  static async update(ctx) {
    console.log('update')
    const item = ctx.request.body
    // 校验item.resources中的数据是否都在item父元素的resources中
    if (item.pid) {
      const parent = await Role.findOne({ id: item.pid })
      const parentResources = parent.resources
      const invalidResources = item.resources.filter((resource) => !parentResources.includes(resource))
      if (invalidResources.length > 0) {
        ctx.throw(400, '父角色中不包含当前角色的某些资源，更新失败')
      }
    }
    // 更新当前角色
    const res = await Role.replaceOne({ id: item.id }, item)

    // 获取所有子角色并更新其资源
    const regex = new RegExp(`^${item.id}-`)
    await Role.updateMany({ path: regex }, [
      {
        $set: {
          resources: {
            $filter: {
              input: '$resources',
              cond: { $in: ['$$this', item.resources] }
            }
          }
        }
      }
    ])
    ctx.body = res
  }

  static async reorder(ctx) {
    console.log('reorder')
    const req = ctx.request.body
    const data = req.map((id, index) => {
      return {
        updateOne: {
          filter: { id: id },
          update: { order: index + 1 }
        }
      }
    })
    const res = await Role.bulkWrite(data)
    ctx.body = res
  }

  static async remove(ctx) {
    const { path } = ctx.request.body
    // 创建一个正则表达式来匹配所有需要删除的角色ID及其子角色
    // 使用 $or 操作符来匹配所有符合条件的文档
    const res = await Role.deleteMany({ path: new RegExp(`^${path}(-\\d+)*$`) })
    ctx.body = res
    console.log(res)
  }
}

export default RoleController
