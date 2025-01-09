import crypto from 'crypto'
import CustomError from '../CustomError.js'

const authSign = async (ctx, next) => {
  const NONCE_TTL = 600
  const EXP_THRESHOLD = 600000
  console.log('authSign')
  const timestamp = ctx.headers['timestamp']
  const nonce = ctx.headers['nonce']
  if (!timestamp || !nonce) {
    throw new CustomError(401, 'Authentication Failed', 911)
  }
  const timestamp_server = Date.now()
  let params = sortJSON(ctx.request.body)
  console.log('params', params)
  if (!params) params = {}
  const paramsText = JSON.stringify(params) + nonce + timestamp
  const chiperText = crypto.createHmac('sha256', process.env.SIGN_KEY).update(paramsText).digest('hex')
  const signMatch = ctx.headers['sign'] === chiperText
  // 判断时间戳是否过期，误差±10分钟
  const timeNotExp = Math.abs(timestamp_server - timestamp) < EXP_THRESHOLD
  const nonceNotUsed = !(await ctx.redis.del(`nonce:${nonce}`))
  // console.log(signMatch, timeNotExp, nonceNotUsed)
  if (signMatch && timeNotExp && nonceNotUsed) {
    // 将本次的nonce写入redis，并设置10分钟的过期时间
    await ctx.redis.set(`nonce:${nonce}`, 'u', 'EX', NONCE_TTL)
    await next()
  } else {
    throw new CustomError(401, 'Authentication Failed', 910)
  }
}

function sortJSON(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }

  const sortedObj = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sortedObj[key] = sortJSON(obj[key])
    })

  return sortedObj
}

export default authSign
