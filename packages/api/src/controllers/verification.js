import CustomError from '../CustomError.js'

class VerificationController {
  // 发送邮件验证码
  static async sendCodeByEmail(ctx) {
    let { email, accountid } = ctx.request.body
    if (!accountid) {
      throw new CustomError(401, 'Authentication Failed', 101)
    }
    // 重发倒计时
    const nolock = await ctx.redis.set(`emaillock:${accountid}`, '*', 'NX', 'EX', 60)
    if (nolock) {
      const code = VerificationController.getRandomDigits(6)
      // TODO: 调用发送邮件
      // TODO
      // 生成随机数缓存，5分钟内有效
      await ctx.redis.set(`emailcode:${accountid}`, code, 'EX', 300)
      ctx.body = { result: true }
      console.log('code', code)
    } else {
      throw new CustomError(400, 'Too Frequently', 102)
    }
  }

  // 发送短信验证码
  static async sendCodeBySMS(ctx) {
    let { areacode, phone, accountid } = ctx.request.body
    if (!accountid) {
      throw new CustomError(401, 'Authentication Failed', 103)
    }
    const nolock = await ctx.redis.set(`smslock:${accountid}`, '*', 'NX', 'EX', 60)
    if (nolock) {
      const code = VerificationController.getRandomDigits(6)
      // TODO: 调用发送邮件
      // TODO

      // 生成随机数缓存，2分钟内有效
      await ctx.redis.set(`smscode:${accountid}`, code, 'EX', 120)
      ctx.body = { result: true }
      console.log(code)
    } else {
      throw new CustomError(400, 'Too Frequently', 104)
    }
  }

  static getRandomDigits(length) {
    if (length > 10) length = 10
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0')
  }
}

export default VerificationController
