import jwt from 'jsonwebtoken'
import CustomError from '../CustomError.js'

const authToken = async (ctx, next) => {
  // console.log('==call func authToken===')
  let token = '',
    decoded,
    err
  let t = ctx.request.headers['authorization']
  if (t) {
    token = t.replace(/^bearer\s+/i, '')
  } else {
    throw new CustomError(401, 'Authentication Failed', 901)
  }
  jwt.verify(token, process.env.SECRET_KEY_ACCESS, (error, d) => {
    decoded = d
    err = error
  })
  // 如果accesstoken验证通过，放行
  if (!err) {
    ctx.request.headers['accountid'] = decoded.id
    // console.log('- Token is Valid')
    await next()
  }
  // 如果是token过期
  // 开始验证refreshtoken
  else if (err.name === 'TokenExpiredError') {
    // const result = await refreshToken(refreshtoken_old, ctx)
    // ctx.set({
    //   newaccesstoken: result.accessToken,
    //   newrefreshtoken: result.refreshToken
    // })
    // ctx.request.headers['accountid'] = result.id
    ctx.status = 409
    // await next()
  }
  // 如果accesstoken内容验证失败
  else {
    throw new CustomError(401, 'Authentication Failed', 902)
  }
}

export default authToken
