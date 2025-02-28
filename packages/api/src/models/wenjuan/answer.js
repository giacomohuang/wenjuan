import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    wenjuanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wenjuan',
      required: true
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    },
    submitTime: {
      type: Date,
      default: Date.now
    },
    submitUser: {
      type: String,
      default: 'anonymous'
    },
    submitIp: String,
    submitDevice: String,
    submitLocation: {
      type: {
        province: String,
        city: String,
        district: String
      },
      default: null
    }
  },
  {
    timestamps: true
  }
)

// 创建索引
answerSchema.index({ wenjuanId: 1, submitTime: -1 })
answerSchema.index({ wenjuanId: 1, submitUser: 1 })

const Answer = mongoose.model('Answer', answerSchema)

export default Answer
