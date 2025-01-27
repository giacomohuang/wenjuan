import mongoose from 'mongoose'

const wenjuanSchema = new mongoose.Schema(
  {
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
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
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
    cooperator: [
      {
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Account'
        },
        role: {
          type: String,
          enum: ['viewer', 'editor'],
          default: 'editor'
        }
      }
    ],
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    }
  },
  {
    timestamps: true
    // toJSON: { virtuals: true }
    // toObject: { virtuals: true }
  }
)

export default mongoose.model('Wenjuan', wenjuanSchema, 'wenjuan')
