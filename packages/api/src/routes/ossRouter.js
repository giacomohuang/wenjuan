import Router from '@koa/router'
import authToken from '../middlewares/authtoken.js'
import OSSController from '../controllers/oss.js'
import multer from '@koa/multer'

const upload = multer()

const ossRouter = new Router()
ossRouter.post('/oss/uploadPart', upload.single('file'), authToken, OSSController.uploadPart)
ossRouter.post('/oss/initNewMultipartUpload', authToken, OSSController.initNewMultipartUpload)
ossRouter.post('/oss/completeMultipartUpload', authToken, OSSController.completeMultipartUpload)

ossRouter.post('/oss/svgIconUpload', upload.single('file'), authToken, OSSController.svgIconUpload)
ossRouter.post('/oss/svgIconList', authToken, OSSController.svgIconList)
ossRouter.post('/oss/addSvgIcon', authToken, OSSController.addSvgIcon)
ossRouter.post('/oss/removeSvgIcon', authToken, OSSController.removeSvgIcon)

export default ossRouter
