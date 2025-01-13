import Router from '@koa/router'
import TeamController from '../controllers/team.js'
import authToken from '../middlewares/authtoken.js'

const teamRouter = new Router()

// 所有团队相关的路由都需要登录
teamRouter.use(authToken)

// 团队管理路由
teamRouter.post('/team/create', TeamController.create)
teamRouter.post('/team/list', TeamController.list)
// teamRouter.post('/team/detail', TeamController.detail)
teamRouter.post('/team/update', TeamController.update)
teamRouter.post('/team/delete', TeamController.delete)

// 团队成员管理路由
teamRouter.post('/team/memberlist', TeamController.memberList)
teamRouter.post('/team/addmember', TeamController.addMember)
teamRouter.post('/team/removeMember', TeamController.removeMember)
teamRouter.post('/team/updateMemberRole', TeamController.updateMemberRole)

export default teamRouter
