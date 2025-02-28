import Router from '@koa/router'
import wenjuanController from '../controllers/wenjuan.js'
import authToken from '../middlewares/authtoken.js'

const wenjuanRouter = new Router()

// wenjuanRouter.use(authToken)

wenjuanRouter.post('/wenjuan/list', authToken, wenjuanController.list)
wenjuanRouter.post('/wenjuan/get', authToken, wenjuanController.get)
wenjuanRouter.post('/wenjuan/update', authToken, wenjuanController.update)
wenjuanRouter.post('/wenjuan/remove', authToken, wenjuanController.remove)
wenjuanRouter.post('/wenjuan/getVersion', authToken, wenjuanController.getVersion)
wenjuanRouter.post('/wenjuan/getVersionList', authToken, wenjuanController.getVersionList)
wenjuanRouter.post('/wenjuan/cooperatorList', authToken, wenjuanController.cooperatorList)
wenjuanRouter.post('/wenjuan/addCooperator', authToken, wenjuanController.addCooperator)
wenjuanRouter.post('/wenjuan/updateCooperatorRole', authToken, wenjuanController.updateCooperatorRole)
wenjuanRouter.post('/wenjuan/removeCooperator', authToken, wenjuanController.removeCooperator)

// 新增统计相关路由
wenjuanRouter.post('/wenjuan/stat', authToken, wenjuanController.getStat)
wenjuanRouter.post('/wenjuan/submit/:id', wenjuanController.submit)

export default wenjuanRouter
