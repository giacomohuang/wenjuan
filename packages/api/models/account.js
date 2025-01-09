import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  // 账户名
  accountname: {
    type: String,
    required: true,
    unique: true
  },
  // 真实姓名
  realname: {
    type: String,
    required: true,
    unique: false
  },
  // 英文名
  engname: {
    type: String,
    unique: false,
    required: false
  },
  // 别名
  aliasname: {
    type: String,
    unique: false,
    required: false
  },
  // 拼音
  pinyin: {
    type: String,
    unique: false,
    required: false
  },
  // 密码
  password: {
    type: String,
    required: true,
    encrypted: true
  },
  // 组织id
  orgId: {
    type: String,
    required: false
  },
  // 组织完整名称
  orgFullName: {
    type: String,
    required: false
  },
  // 实体id
  entityId: {
    type: String,
    required: false
  },
  // 头像
  avatar: {
    type: String,
    required: false
  },
  // 电话区号
  areacode: {
    type: String,
    required: false
  },
  // 电话号码
  phone: {
    type: String,
    required: false
  },
  // 邮箱
  email: {
    type: String,
    required: false
  },
  // 账户类型
  type: {
    type: Number,
    required: false
  },
  // totp秘钥
  totpSecret: {
    type: String,
    required: false
  },
  // 是否开启2FA
  enable2FA: {
    type: Boolean,
    required: false
  },
  // 是否需要重设密码
  initPwd: {
    type: Boolean,
    required: false
  },
  // 状态: [启用:1 禁用:0]
  status: {
    type: Number,
    required: false
  },
  // 操作人id
  OperatorId: {
    type: String,
    required: false
  },
  // 操作时间
  OperateTime: {
    type: Date,
    required: false
  }
})

export default mongoose.model('Account', accountSchema)
