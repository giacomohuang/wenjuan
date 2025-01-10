import Router from '@koa/router'
import VerificationController from '../controllers/verification.js'

const verificationRouter = new Router()

verificationRouter.post('/verification/sendcodebyemail', VerificationController.sendCodeByEmail)
verificationRouter.post('/verification/sendcodebysms', VerificationController.sendCodeBySMS)

export default verificationRouter
