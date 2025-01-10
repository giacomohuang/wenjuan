import BaseController from './base.js'
import Team from '../models/team.js'

class TeamController extends BaseController {
  // 获取团队列表
  static async list(ctx) {
    console.log('list', ctx.request.body)
    const { page = 1, pageSize = 10, keyword } = ctx.request.body

    const query = {
      isDeleted: false
    }

    if (keyword) {
      query.name = new RegExp(keyword, 'i')
    }

    const total = await Team.countDocuments(query)
    const list = await Team.find(query)
      .populate('operator', '_id accountname realname avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
    ctx.body = {
      list: list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  }

  // 创建团队
  static async create(ctx) {
    const { name, description } = ctx.request.body
    const accountId = ctx.request.headers['accountid']

    const team = new Team({
      name,
      description,
      operator: accountId
    })

    const res = await team.save()
    ctx.body = res
  }

  // 更新团队信息
  static async update(ctx) {
    const { id, name, description } = ctx.request.body
    const accountId = ctx.request.headers['accountid']
    const res = await Team.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { name, description, operator: accountId } }, { new: true, runValidators: true })
    ctx.body = res
    console.log('update', res)
  }

  // 删除团队
  static async delete(ctx) {
    const { id } = ctx.params
    const userId = ctx.state.user.id

    const team = await Team.findOne({
      _id: id,
      isDeleted: false,
      'members.user': userId
    })

    if (!team) {
      ctx.throw(404, '团队不存在')
    }

    // 检查权限
    const member = team.members.find((m) => m.user.toString() === userId)
    if (member.role !== 'admin') {
      ctx.throw(403, '没有权限删除团队')
    }

    team.isDeleted = true
    await team.save()

    ctx.body = { code: 0, message: '删除成功' }
  }

  // 添加团队成员
  static async addMember(ctx) {
    const { teamId, accountId, role = 'member' } = ctx.request.body
    const currentAccountId = ctx.request.headers['accountid']

    // // 检查权限
    // const member = team.members.find((m) => m.user.toString() === currentUserId)
    // if (member.role !== 'admin') {
    //   ctx.throw(403, '没有权限添加成员')
    // }

    const team = await Team.findOne({
      _id: teamId,
      isDeleted: false
    })
    if (!team) {
      ctx.throw(404, '团队不存在')
    }
    // 检查用户是否已经是成员
    if (team.members.some((m) => m.memberInfo.toString() === accountId)) {
      ctx.throw(400, '该用户已经是团队成员')
    }

    team.members.push({ memberInfo: accountId, role })
    await team.save()

    ctx.body = team
  }

  // 移除团队成员
  static async removeMember(ctx) {
    const { teamId, accountId } = ctx.request.body
    const currentAccountId = ctx.request.headers['accountid']
    console.log('removeMember', teamId, accountId)

    const res = await Team.updateOne(
      {
        _id: teamId,
        'members.memberInfo': accountId
      },
      {
        $pull: {
          members: { memberInfo: accountId }
        }
      }
    )
    console.log('res', res)

    // if (!team) {
    //   ctx.throw(404, '团队不存在')
    // }

    // // 不能移除创建者
    // if (team.operator.toString() === accountId) {
    //   ctx.throw(400, '不能移除团队创建者')
    // }

    // team.members = team.members.filter((m) => m.memberInfo.toString() !== accountId)
    // await team.save()

    ctx.body = res
  }

  // 获取团队成员列表
  static async memberList(ctx) {
    const { teamId } = ctx.request.body

    const team = await Team.findOne({
      _id: teamId,
      isDeleted: false
    })
      .populate('operator', '_id accountname realname avatar')
      .populate('members.memberInfo', '_id accountname realname avatar')

    console.log(team)
    if (!team) {
      ctx.throw(404, '团队不存在')
    }

    ctx.body = team
  }
}

export default TeamController
