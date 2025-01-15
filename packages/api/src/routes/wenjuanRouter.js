import Router from '@koa/router'
import wenjuanController from '../controllers/wenjuan.js'
import authToken from '../middlewares/authtoken.js'

const wenjuanRouter = new Router()

wenjuanRouter.use(authToken)

wenjuanRouter.post('/wenjuan/list', wenjuanController.list)
wenjuanRouter.post('/wenjuan/get', wenjuanController.get)
wenjuanRouter.post('/wenjuan/update', wenjuanController.update)
wenjuanRouter.post('/wenjuan/remove', wenjuanController.remove)
wenjuanRouter.post('/wenjuan/getVersion', wenjuanController.getVersion)
wenjuanRouter.post('/wenjuan/getVersionList', wenjuanController.getVersionList)

// 协作者管理路由
wenjuanRouter.post('/wenjuan/cooperatorList', wenjuanController.cooperatorList)
wenjuanRouter.post('/wenjuan/addCooperator', wenjuanController.addCooperator)
wenjuanRouter.post('/wenjuan/removeCooperator', wenjuanController.removeCooperator)
wenjuanRouter.post('/wenjuan/updateCooperatorRole', wenjuanController.updateCooperatorRole)
export default wenjuanRouter
