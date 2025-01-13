import mongoose from 'mongoose'

const wenjuanSchema = new mongoose.Schema({
  name: {
    type: String
  },
  draft: {
    type: JSON
  },
  isPublish: {
    type: Boolean,
    default: false
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  version: {
    type: Number,
    default: 0
  },
  settings: {
    type: Object
  },
  data: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }
})

export default mongoose.model('Wenjuan', wenjuanSchema, 'wenjuan')
