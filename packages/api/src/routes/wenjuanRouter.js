import Router from '@koa/router'
import wenjuanController from '../controllers/wenjuan.js'

const wenjuanRouter = new Router()

wenjuanRouter.post('/wenjuan/list', wenjuanController.list)
wenjuanRouter.post('/wenjuan/get', wenjuanController.get)
wenjuanRouter.post('/wenjuan/update', wenjuanController.update)
wenjuanRouter.post('/wenjuan/remove', wenjuanController.remove)
wenjuanRouter.post('/wenjuan/getVersion', wenjuanController.getVersion)
wenjuanRouter.post('/wenjuan/getVersionList', wenjuanController.getVersionList)
wenjuanRouter.post('/wenjuan/createSpace', wenjuanController.createSpace)
wenjuanRouter.post('/wenjuan/getSpace', wenjuanController.getSpace)
wenjuanRouter.post('/wenjuan/getSpaceList', wenjuanController.getSpaceList)

export default wenjuanRouter
