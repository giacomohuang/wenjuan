import mongoose from 'mongoose'
import i18nPlugin from '../utils/mongoose-i18n.js'

const roleSchema = new mongoose.Schema({
  // 角色名称
  name: {
    type: String,
    required: true,
    unique: true,
    i18n: true
  },
  // id
  id: {
    type: Number,
    required: true,
    unique: true
  },
  // 父id
  pid: {
    type: Number,
    required: false
  },
  // 描述
  description: {
    type: String,
    required: false,
    i18n: true
  },
  // 资源
  resources: {
    type: Array,
    required: false
  },
  // 路径
  path: {
    type: String,
    required: true
  },
  // 层级
  level: {
    type: Number,
    required: true
  },
  // 排序
  order: {
    type: Number,
    required: false
  }
})

// roleSchema.index({ id: 1 })
roleSchema.index({ 'name.zh-CN': 1 })
roleSchema.index({ 'name.zh-HK': 1 })
roleSchema.index({ 'name.en': 1 })
roleSchema.index({ 'name.ja': 1 })
roleSchema.index({ 'name.ko': 1 })
roleSchema.index({ 'name.ar': 1 })

roleSchema.plugin(i18nPlugin)

export default mongoose.model('Role', roleSchema)
