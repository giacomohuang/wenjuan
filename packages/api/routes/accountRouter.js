import Router from '@koa/router'
import authToken from '../middlewares/authtoken.js'
import AccountController from '../controllers/account.js'

const accountRouter = new Router()

// Account & My
accountRouter.post('/account/refreshtoken', AccountController.refreshToken)

accountRouter.post('/account/signup', AccountController.signup)
accountRouter.post('/account/signin', AccountController.signin)
accountRouter.post('/account/signin2FA', AccountController.signin2FA)
accountRouter.post('/account/signout', AccountController.signout)
accountRouter.post('/account/verifytoken', authToken, AccountController.verifyToken)
accountRouter.post('/account/generatetotpsecret', authToken, AccountController.generateTotpSecret)
accountRouter.post('/account/verifytotp', authToken, AccountController.verifyTotp)
accountRouter.post('/account/updatetotpsecret', authToken, AccountController.updateTotpSecret)
accountRouter.post('/account/hello', AccountController.hello)
accountRouter.post('/account/hello1', authToken, AccountController.hello1)

accountRouter.post('/account/getauthinfo', authToken, AccountController.getAuthInfo)
accountRouter.post('/account/updatepassword', authToken, AccountController.updatePassword)
accountRouter.post('/account/initpassword', AccountController.initPassword)
accountRouter.post('/account/updateemail', authToken, AccountController.updateEmail)
accountRouter.post('/account/updatephone', authToken, AccountController.updatePhone)
accountRouter.post('/account/update2fa', authToken, AccountController.update2FA)

accountRouter.post('/account/list', authToken, AccountController.list)
accountRouter.post('/account/get', authToken, AccountController.get)
accountRouter.post('/account/searchbyname', authToken, AccountController.searchByName)

export default accountRouter
