import Koa from 'koa'
import { bodyParser } from '@koa/bodyparser'
import accountRouter from './routes/accountRouter.js'
import permissionRouter from './routes/permissionRouter.js'
import verificationRouter from './routes/verificationRouter.js'
import wenjuanRouter from './routes/wenjuanRouter.js'
import orgRouter from './routes/orgRouter.js'
import ossRouter from './routes/ossRouter.js'
import mongoose from 'mongoose'
import cors from '@koa/cors'
import authSign from './middlewares/authsign.js'
import errorHandler from './middlewares/errorHandler.js'
import Redis from 'ioredis'
import i18nPlugin from './utils/mongoose-i18n.js'

const app = new Koa()
const redis = new Redis()
const PORT = 3000
// app.use(logger())
app.use(bodyParser())
app.use(
  cors({
    // origin: 'http://localhost:8080',
    origin: '*',
    maxAge: 3600,
    allowMethods: 'GET,POST',
    exposeHeaders: 'Authorization,Refreshtoken',
    credentials: true
  })
)
// app.use(authSign)
// 统一异常处理中间件
app.use(errorHandler)

// 将ioredis绑定到Koa的context上，以便在上下文中使用
app.context.redis = redis

// 1. 首先注册插件
mongoose.plugin(i18nPlugin)

// 2. 然后再连接数据库
mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB is connected!')
})

// console.log(accountRouter)
app.use(accountRouter.routes(), authSign)
app.use(verificationRouter.routes(), authSign)
app.use(ossRouter.routes(), authSign)
app.use(permissionRouter.routes(), authSign)
app.use(orgRouter.routes(), authSign)
app.use(wenjuanRouter.routes(), authSign)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
