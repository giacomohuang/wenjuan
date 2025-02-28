import BaseController from './base.js'
import Wenjuan from '../models/wenjuan/wenjuan.js'
import Version from '../models/wenjuan/version.js'
import CustomError from '../CustomError.js'
import Answer from '../models/wenjuan/answer.js'

class WenjuanController extends BaseController {
  static async list(ctx) {
    const { page = 1, limit = 10, keywords, teamId, sort = { updatedAt: -1 } } = ctx.request.body
    const accId = ctx.request.headers['accountid']
    // console.log('list params:', { page, limit, query, sort })

    const query = {}
    if (keywords) {
      query.name = { $regex: keywords, $options: 'i' }
    }
    query.team = teamId
    if (accId) {
      query['cooperator.account'] = accId
    } else {
      throw new CustomError(401, '未登录', 50100)
    }
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
    const res = await Wenjuan.findOne({ _id: id }).populate('team', 'name')
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
      updateData.cooperator = [{ account: accountId, role: 'editor' }]
      updateData.settings = {
        // 基础设置
        description: '',
        status: true,
        tags: [],
        timeLimit: 0,
        submitLimitType: 'none',
        submitLimitCount: 1,
        collectTime: null,
        // 外观和封面设置
        bgColor: '#ffffff',
        textColor: '#000000',
        coverImage: '',
        coverBgColor: '#ffffff',
        coverTextColor: '#000000',
        bgImage: '',
        themeColorMode: 'custom',
        themeColor: '#0090ff',
        // 显示设置
        showProgress: true,
        showQuestionNumber: true,
        showOnePerPage: false,
        questionsPerPage: 5,
        // 提交设置
        allowMultiSubmit: false,
        submitSuccessMessage: null
      }

      // updateData.data = []
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

  // 获取问卷协作者列表
  static async cooperatorList(ctx) {
    const { id } = ctx.request.body
    const res = await Wenjuan.findOne({ _id: id }).select('cooperator').populate('cooperator.account', 'accountname realname avatar')
    ctx.body = res
    console.log(res)
  }

  // 添加协作者
  static async addCooperator(ctx) {
    const { id, accountId, role } = ctx.request.body
    // 检查用户是否已经是成员
    const wenjuan = await Wenjuan.findOne({ _id: id })
    if (wenjuan.cooperator.some((m) => m.account.toString() === accountId)) {
      throw new CustomError(400, '该用户已经是协作者', 4001)
    }

    wenjuan.cooperator.push({ account: accountId, role: role })
    await wenjuan.save()
    ctx.body = wenjuan
  }

  // 更新协作者角色
  static async updateCooperatorRole(ctx) {
    const { id, accountId, role } = ctx.request.body
    const res = await Wenjuan.findOneAndUpdate({ _id: id, 'cooperator.account': accountId }, { $set: { 'cooperator.$.role': role } }, { new: true })
    ctx.body = res
  }

  // 移除协作者
  static async removeCooperator(ctx) {
    const { id, accountId } = ctx.request.body
    const currentAccountId = ctx.request.headers['accountid']
    if (currentAccountId == accountId) {
      throw new CustomError(400, '不能移除自己', 4003)
    }
    const res = await Wenjuan.findOneAndUpdate({ _id: id }, { $pull: { cooperator: { account: accountId } } }, { new: true })
    ctx.body = res
  }

  // 获取问卷统计数据
  static async getStat(ctx) {
    const { id, page = 1, limit = 10 } = ctx.request.body

    try {
      // 获取问卷基本信息
      const wenjuan = await Wenjuan.findById(id)
      if (!wenjuan) {
        throw new CustomError(404, '问卷不存在')
      }

      // 获取答卷总数
      const totalAnswers = await Answer.countDocuments({ wenjuanId: id })

      // 获取答卷列表
      const answerList = await Answer.find({ wenjuanId: id })
        .sort({ submitTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()

      // 获取所有答卷数据用于统计
      const allAnswers = await Answer.find({ wenjuanId: id }).lean()

      // 统计每个题目的答案分布
      const statistics = {}
      wenjuan.data.forEach((question) => {
        if (['SingleChoice', 'MultiChoice'].includes(question.type)) {
          // 选择题统计
          statistics[question.id] = question.options.reduce((acc, opt) => {
            acc[opt.id] = 0
            return acc
          }, {})
        } else if (['Rate', 'NPS'].includes(question.type)) {
          // 评分题统计
          const min = question.type === 'NPS' ? 0 : question.minScore
          const max = question.type === 'NPS' ? 10 : question.maxScore
          statistics[question.id] = Array(max - min + 1).fill(0)
        }
      })

      // 计算统计数据
      allAnswers.forEach((answer) => {
        Object.entries(answer.answers).forEach(([qId, value]) => {
          const question = wenjuan.data.find((q) => q.id === qId)
          if (!question) return

          if (['SingleChoice'].includes(question.type)) {
            // 单选题
            if (statistics[qId] && statistics[qId][value]) {
              statistics[qId][value]++
            }
          } else if (['MultiChoice'].includes(question.type)) {
            // 多选题
            if (Array.isArray(value)) {
              value.forEach((optId) => {
                if (statistics[qId] && statistics[qId][optId]) {
                  statistics[qId][optId]++
                }
              })
            }
          } else if (['Rate', 'NPS'].includes(question.type)) {
            // 评分题和NPS
            const min = question.type === 'NPS' ? 0 : question.minScore
            if (typeof value === 'number' && statistics[qId]) {
              const index = value - min
              if (index >= 0 && index < statistics[qId].length) {
                statistics[qId][index]++
              }
            }
          }
        })
      })

      ctx.body = {
        wenjuan,
        totalAnswers,
        answerList,
        statistics,
        pagination: {
          total: totalAnswers,
          current: page,
          pageSize: limit
        }
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError(500, '获取统计数据失败')
    }
  }

  // 提交问卷答案
  static async submit(ctx) {
    const { id } = ctx.params
    const answers = ctx.request.body
    const ip = ctx.request.ip
    const userAgent = ctx.request.headers['user-agent']

    try {
      // 检查问卷是否存在
      const wenjuan = await Wenjuan.findById(id)
      if (!wenjuan) {
        throw new CustomError(404, '问卷不存在')
      }

      // 检查问卷是否在收集时间范围内
      if (wenjuan.settings?.collectTime) {
        const [start, end] = wenjuan.settings.collectTime
        const now = new Date()
        if (now < new Date(start) || now > new Date(end)) {
          throw new CustomError(403, '当前不在问卷收集时间范围内')
        }
      }

      // 创建答案记录
      const answer = new Answer({
        wenjuanId: id,
        answers,
        submitIp: ip,
        submitDevice: userAgent
      })

      await answer.save()

      ctx.body = {
        message: '提交成功'
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError(500, '提交答案失败')
    }
  }
}

export default WenjuanController
