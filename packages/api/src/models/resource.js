import mongoose from 'mongoose'
import i18nPlugin from '../utils/mongoose-i18n.js'

const resourceSchema = new mongoose.Schema({
  // id
  id: {
    type: Number,
    required: true,
    unique: true
  },
  // 资源名称（多语言）
  name: {
    type: String,
    required: true,
    i18n: true
  },
  // 父id
  pid: {
    type: Number,
    required: false
  },
  // 编码
  code: {
    type: String,
    required: true
  },
  // 类型
  // 1: 菜单
  // 2: 功能
  // 3: 数据
  type: {
    type: Number,
    required: true
  },
  // 路径
  path: {
    type: String,
    required: true
  },
  // 排序
  order: {
    type: Number,
    required: false
  },

  // 链接类型，仅对菜单类型有效
  // 1: 路由
  // 2: 外部链接
  linkType: {
    type: Number,
    required: false
  },
  // 路由，仅对功能类型有效
  router: {
    type: String,
    required: false
  },
  // 路由或外部链接，仅对菜单类型有效
  link: {
    type: String,
    required: false
  },
  // 图标，仅对菜单类型有效
  icon: {
    type: String,
    required: false
  },
  // 图标类型，仅对菜单类型有效
  // 1: system
  // 2: custom
  iconType: {
    type: Number,
    required: false
  },
  // 页面跳转方式，仅对菜单类型有效
  // self: 当前页面
  // _blank: 新页面
  target: {
    type: String,
    required: false
  },
  // 是否隐藏，仅对菜单类型有效
  isHidden: {
    type: Boolean,
    required: false,
    default: false
  },
  // 状态：0禁用 1启用
  status: {
    type: Number,
    required: false,
    default: 1
  }
})

// 添加索引
resourceSchema.index({ 'name.zh-CN': 1 })
resourceSchema.index({ 'name.zh-HK': 1 })
resourceSchema.index({ 'name.en': 1 })
resourceSchema.index({ 'name.ar': 1 })
resourceSchema.index({ 'name.ja': 1 })
resourceSchema.index({ 'name.ko': 1 })
resourceSchema.index({ path: 1 })
resourceSchema.index({ type: 1 })

resourceSchema.plugin(i18nPlugin)

export default mongoose.model('Resource', resourceSchema)
