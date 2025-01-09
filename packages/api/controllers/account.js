import BaseController from './base.js'
import Account from '../models/account.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import speakeasy from 'speakeasy'
import CustomError from '../CustomError.js'
import OpenAIService from '../services/openai.js'
import { PassThrough } from 'stream'

class AccountController extends BaseController {
  // 注册新用户
  static async signup(ctx) {
    const { accountname, password } = ctx.request.body
    const account = new Account({ accountname, password })
    await account.save()
    ctx.status = 201
    ctx.body = { result: true }
  }

  static async list(ctx) {
    // console.log('aaaa')
    const { page, limit, query } = ctx.request.body
    console.log(page, limit, query)
    const accounts = await Account.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    console.log(accounts)
    const total = await Account.countDocuments(query)
    ctx.body = {
      accounts,
      total: total,
      pages: Math.ceil(total / limit)
    }
  }

  static async get(ctx) {
    const { id } = ctx.request.body
    const res = await Account.findById(id)
    ctx.body = res
    console.log(res)
  }

  static async searchByName(ctx) {
    const { keyword, page = 1, limit = 10 } = ctx.request.body
    const regex = new RegExp(keyword, 'i')
    if (keyword === '') {
      ctx.body = []
      return
    }
    const query = {
      $or: [{ accountname: regex }, { realname: regex }, { engname: regex }, { aliasname: regex }, { pinyin: regex }]
    }

    const skip = (page - 1) * limit
    const res = await Account.find(query).skip(skip).limit(limit).exec()

    const total = await Account.countDocuments(query)

    ctx.body = {
      accounts: res,
      total: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  }

  // 登录STEP1
  static async signin(ctx) {
    const { accountname, password } = ctx.request.body
    // 先删除旧的refreshToken的redis缓存
    const oldRefreshToken = ctx.request.headers['refreshtoken']
    if (oldRefreshToken) {
      const oldSHAToken = crypto.createHmac('sha256', process.env.SECRET_KEY_REFRESH).update(oldRefreshToken).digest('hex')
      await ctx.redis.del(`auth:${oldSHAToken}`)
    }
    // 验证账号/密码是否正确
    const cryptoPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(password).digest('hex')
    const account = await Account.findOne({ accountname })
    if (!account || account.password !== cryptoPwd) {
      throw new CustomError(400, 'Invalid accountname or password', 1001)
    }

    if (account.totpSecret) account.totpSecret = '*'
    account.password = ''
    ctx.body = account._doc
    if (!account.enable2FA) {
      const { accessToken, refreshToken } = await AccountController.genToken(ctx, account)
      ctx.body.accessToken = accessToken
      ctx.body.refreshToken = refreshToken
    }
  }

  // 登录STEP2-两步验证
  static async signin2FA(ctx) {
    const { accountname, password, authMethod, code } = ctx.request.body

    // 先验证账号密码是否正确，同时取出账户信息
    const cryptoPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(password).digest('hex')
    const account = await Account.findOne({ accountname })
    // 如果账号密码错误，被前端攻击，抛异常
    if (!account || account.password !== cryptoPwd) {
      throw new CustomError(400, 'Invalid accountname or password', 1001)
    }
    let result2FA = false
    // console.log(account.totpSecret, code)
    // 根据不同的认证方式进行验证
    switch (authMethod) {
      case 'totp':
        result2FA = speakeasy.totp.verify({
          secret: account.totpSecret,
          encoding: 'base32',
          token: code
        })
        // console.log(result2FA)
        break
      case 'sms':
        result2FA = true
        break
      case 'email':
      default:
        result2FA = true
        break
    }

    // 两步验证通过了才能生成token
    // Generate JWT token
    if (result2FA) {
      ctx.body = await AccountController.genToken(ctx, account)
    } else {
      throw new CustomError(400, 'Code Error', 1002)
    }
  }

  // 生成accessToken和refreshToken
  static async genToken(ctx, account) {
    const accessToken = jwt.sign({ id: account._id, accountname: account.accountname, realname: encodeURIComponent(account.realname) }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
    const refreshToken = jwt.sign({ id: account._id, accountname: account.accountname, realname: encodeURIComponent(account.realname) }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
    const shaToken = crypto.createHmac('sha256', process.env.SECRET_KEY_REFRESH).update(refreshToken).digest('hex')
    // 缓存30天
    await ctx.redis.set(`auth:${shaToken}`, 't', 'EX', 2592000)
    console.log('\n\n====GenToken====')
    console.log('accessToken:', refreshToken)
    console.log('refreshToken:', refreshToken)
    console.log('refreshToken_SHA256:', shaToken)
    console.log('====GenToken====\n\n')
    return { accessToken, refreshToken }
  }

  // 退登
  static async signout(ctx) {
    const refreshToken = ctx.request.headers['refreshtoken']
    console.log(refreshToken)
    const shaToken = crypto.createHmac('sha256', process.env.SECRET_KEY_REFRESH).update(refreshToken).digest('hex')
    console.log(shaToken)
    await ctx.redis.del(`auth:${shaToken}`)
    ctx.body = { result: true }
    //TODO：signout log
  }

  // 验证token有效性，Vue router专用
  static async verifyToken(ctx) {
    ctx.body = {}
  }

  // 生成动态令牌的secret和激活地址
  static async generateTotpSecret(ctx) {
    const { accountname } = ctx.request.body
    console.log('accountname', accountname)
    const secret = speakeasy.generateSecret({
      length: 20
    })
    const url = speakeasy.otpauthURL({ secret: secret.ascii, label: accountname, issuer: 'MPAdmin' })
    ctx.body = { url, secret: secret.base32 }
    // console.log(url, secret)
  }

  // 验证动态令牌，仅用于初始化
  static async verifyTotp(ctx) {
    const { secret, token } = ctx.request.body
    // console.log(secret, token)
    var tokenValidates = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    })
    ctx.body = { result: tokenValidates }
  }

  static async getAuthInfo(ctx) {
    const accountid = ctx.request.headers['accountid']
    console.log('accountid:', accountid)
    const authInfo = await Account.findOne({ _id: accountid }).select('areacode phone email totpSecret enable2FA')
    // 如果有totp秘钥，则置为*，不暴露给客户端
    console.log(authInfo)
    if (authInfo.totpSecret) authInfo.totpSecret = '*'
    ctx.body = authInfo._doc
  }

  // 验证并更新邮箱
  static async updateEmail(ctx) {
    const accountid = ctx.request.headers['accountid']
    const { verifycode, email } = ctx.request.body
    // TODO 验证verifycode
    const result = await Account.findOneAndUpdate({ _id: accountid }, { email })
    console.log(result)
    ctx.body = { result: true }
  }

  // 验证并更新邮箱
  static async updatePassword(ctx) {
    const { oldPassword, newPassword } = ctx.request.body
    const accountid = ctx.request.headers['accountid']
    // TODO 验证verifycode
    const cryptoOldPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(oldPassword).digest('hex')
    const cryptoNewPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(newPassword).digest('hex')
    const result = await Account.findOneAndUpdate({ _id: accountid, password: cryptoOldPwd }, { password: cryptoNewPwd })
    if (result) {
      ctx.body = { result: true }
    } else {
      ctx.body = { result: false }
    }
  }

  // 首次登录时修改初始密码
  static async initPassword(ctx) {
    //
    const { accountid, oldPassword, newPassword } = ctx.request.body
    // TODO 验证verifycode
    const cryptoOldPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(oldPassword).digest('hex')
    const cryptoNewPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(newPassword).digest('hex')
    const result = await Account.findOneAndUpdate({ _id: accountid, password: cryptoOldPwd, initPwd: false }, { password: cryptoNewPwd, initPwd: true })
    if (result) {
      ctx.body = { result: true }
    } else {
      ctx.body = { result: false }
    }
  }

  // 更新动态口令秘钥
  static async updateTotpSecret(ctx) {
    const accountid = ctx.request.headers['accountid']
    const { totpSecret } = ctx.request.body
    await Account.findOneAndUpdate({ _id: accountid }, { totpSecret })
    ctx.body = { result: true }
  }

  // 验证并更新手机号
  static async updatePhone(ctx) {
    const accountid = ctx.request.headers['accountid']
    const { verifycode, areacode, phone } = ctx.request.body

    // TODO 验证verifycode
    //
    //

    await Account.findOneAndUpdate({ _id: accountid }, { areacode, phone })
    ctx.body = { result: true }
  }

  // 开启/关闭两步验证
  static async update2FA(ctx) {
    const accountid = ctx.request.headers['accountid']
    const { enable2FA } = ctx.request.body
    // TODO 验证verifycode
    const result = await Account.findOneAndUpdate({ _id: accountid }, { enable2FA })
    ctx.body = { result: true }
  }

  static async hello(ctx) {
    ctx.set({
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream' // 表示返回数据是个 stream
    })
    const stream = new PassThrough()
    ctx.status = 200
    ctx.body = stream
    OpenAIService.sendMessage(stream)
    console.log('finish')
    ctx.req.on('close', () => {
      console.log('client closed')
    })
  }

  static async refreshToken(ctx) {
    const { refreshToken } = ctx.request.body
    if (!refreshToken) throw new CustomError(401, 'Authentication Failed', 905)
    // console.log('==call func refresh===')
    // 判断redis中有没有sha的refreshtoken
    // console.log('token to refresh', refreshToken)
    const shaToken_old = crypto.createHmac('sha256', process.env.SECRET_KEY_REFRESH).update(refreshToken).digest('hex')
    const isExist = await ctx.redis.del(`auth:${shaToken_old}`)
    if (!isExist) {
      throw new CustomError(401, 'Authentication Failed.' + shaToken_old, 903)
    }
    // 验证refreshtoken是否合法，不合法抛异常
    let decoded
    jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH, (err, d) => {
      if (err) {
        throw new CustomError(401, 'Authentication Failed', 904)
      } else {
        decoded = d
      }
    })
    const { id, accountname, realname } = decoded
    const newAccessToken = jwt.sign({ id: id, accountname: accountname, realname: realname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
    const newRefreshToken = jwt.sign({ id: id, accountname: accountname, realname: realname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
    const shaToken = crypto.createHmac('sha256', process.env.SECRET_KEY_REFRESH).update(newRefreshToken).digest('hex')
    await ctx.redis.set(`auth:${shaToken}`, 't', 'EX', 2592000)
    ctx.body = { newAccessToken, newRefreshToken, id }
    console.log('refresh token')
    console.log('newAccessToken', newAccessToken)
    console.log('newRefreshToken', newRefreshToken)
    console.log('id', id)
  }

  static async hello1(ctx) {
    const { num } = ctx.request.body
    ctx.body = 'hello:' + num
  }
}

export default AccountController
