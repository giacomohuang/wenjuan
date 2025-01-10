import Router from '@koa/router'
import authToken from '../middlewares/authtoken.js'
import ResourceController from '../controllers/resource.js'
import RoleController from '../controllers/role.js'

const permissionRouter = new Router()

// resource & role
permissionRouter.post('/permission/resource/get', authToken, ResourceController.get)
permissionRouter.post('/permission/resource/list', authToken, ResourceController.list)
permissionRouter.post('/permission/resource/add', authToken, ResourceController.add)
permissionRouter.post('/permission/resource/remove', authToken, ResourceController.remove)
permissionRouter.post('/permission/resource/update', authToken, ResourceController.update)
permissionRouter.post('/permission/resource/reorder', authToken, ResourceController.reorder)
permissionRouter.post('/permission/resource/getMenu', authToken, ResourceController.getMenu)

permissionRouter.post('/permission/role/get', authToken, RoleController.get)
permissionRouter.post('/permission/role/list', authToken, RoleController.list)
permissionRouter.post('/permission/role/add', authToken, RoleController.add)
permissionRouter.post('/permission/role/remove', authToken, RoleController.remove)
permissionRouter.post('/permission/role/update', authToken, RoleController.update)
permissionRouter.post('/permission/role/reorder', authToken, RoleController.reorder)

export default permissionRouter
