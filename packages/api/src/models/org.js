import mongoose from 'mongoose'

const orgSchema = new mongoose.Schema({
  // 组织ID，唯一标识符
  id: {
    type: Number,
    required: true,
    unique: true
  },
  // 组织名称
  name: {
    type: String,
    required: true
  },
  // 组织全称
  fullname: {
    type: String,
    required: true
  },
  // 组织类型
  type: {
    type: Number,
    required: true
  },
  // 是否为实体组织
  isEntity: {
    type: Boolean,
    default: false
  },
  // 组织负责人ID
  leaderId: {
    type: String,
    default: null
  },
  // 组织负责人姓名
  leaderName: {
    type: String
  },
  // 排序顺序
  order: {
    type: Number,
    default: 1
  },
  // 组织状态
  status: {
    type: Number,
    default: 1
  },
  // 父组织ID
  pid: {
    type: Number,
    default: null
  },
  // 组织路径，用于表示层级关系
  path: {
    type: String,
    required: true
  },
  // 组织角色
  roles: {
    type: Array,
    default: []
  },
  // 成员id列表
  members: {
    type: Array,
    default: []
  }
})

export default mongoose.model('Org', orgSchema)
