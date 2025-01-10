import mongoose from 'mongoose'
import Account from './account.js'

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Account
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    members: [
      {
        memberInfo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Account
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// 添加索引
teamSchema.index({ name: 1 })
teamSchema.index({ operatorId: 1 })
teamSchema.index({ isDeleted: 1 })

// 虚拟字段：成员数量
teamSchema.virtual('memberCount').get(function () {
  return this.members.length
})

const Team = mongoose.model('Team', teamSchema)

export default Team