import Router from '@koa/router'
import OrgController from '../controllers/org.js'

const router = new Router()

// 列出组织
router.post('/org/list', OrgController.list)

// 添加组织
router.post('/org/add', OrgController.add)

// 更新组织
router.post('/org/update', OrgController.update)

// 删除组织
router.post('/org/remove', OrgController.remove)

// 重新排序组织
router.post('/org/reorder', OrgController.reorder)

// 重命名组织
router.post('/org/rename', OrgController.rename)

// 获取组织
router.post('/org/get', OrgController.get)

export default router
