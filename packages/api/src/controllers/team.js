import BaseController from './base.js'
import Team from '../models/team.js'
import CustomError from '../CustomError.js'

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
    const { name, description, creatorId } = ctx.request.body
    const accountId = ctx.request.headers['accountid']
    console.log('accountId', accountId)

    // 检查团队名称是否已存在
    const existingTeam = await Team.findOne({ name, isDeleted: false })
    if (existingTeam) {
      throw new CustomError(400, '团队已存在', 4001)
    }

    const team = new Team({
      name,
      description,
      operator: accountId,
      members: [{ memberInfo: creatorId, role: 'creator' }]
    })

    try {
      const res = await team.save()
      ctx.body = res
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB 唯一索引冲突错误码
        throw new CustomError(400, '团队名称已存在', 4001)
      }
      throw new CustomError(400, error.message, 4000)
    }
  }

  // 更新团队信息
  static async update(ctx) {
    const { id, name, description } = ctx.request.body
    const accountId = ctx.request.headers['accountid']

    // 检查新名称是否与其他团队重复
    const existingTeam = await Team.findOne({
      name,
      _id: { $ne: id }, // 排除当前团队
      isDeleted: false
    })
    if (existingTeam) {
      throw new CustomError(400, '团队名称已存在', 4001)
    }

    try {
      const res = await Team.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { name, description, operator: accountId } }, { new: true, runValidators: true })
      if (!res) {
        throw new CustomError(404, '团队不存在', 4002)
      }
      ctx.body = res
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(400, '团队名称已存在', 4001)
      }
      throw new CustomError(400, error.message, 4000)
    }
  }

  // 删除团队
  static async delete(ctx) {
    const { id } = ctx.request.body
    const accountId = ctx.request.headers['accountid']
    const res = await Team.updateOne({ _id: id }, { $set: { isDeleted: true } })
    ctx.body = res
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
      throw new CustomError(404, '团队不存在', 4002)
    }
    // 检查用户是否已经是成员
    if (team.members.some((m) => m.memberInfo.toString() === accountId)) {
      throw new CustomError(400, '该用户已经是团队成员', 4001)
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
      throw new CustomError(404, '团队不存在', 4002)
    }

    ctx.body = team
  }

  /**
   * 更新团队成员角色
   */
  static async updateMemberRole(ctx) {
    const { teamId, accountId, role } = ctx.request.body

    await Team.updateOne({ _id: teamId, 'members.memberInfo': accountId }, { $set: { 'members.$.role': role } })

    ctx.body = {
      code: 200,
      message: '更新成员角色成功'
    }
  }
}

export default TeamController
