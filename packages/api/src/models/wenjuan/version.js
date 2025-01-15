import mongoose from 'mongoose'
const versionSchema = new mongoose.Schema(
  {
    wenjuanId: {
      type: String
    },
    version: {
      type: Number
    },
    settings: {
      type: Object
    },
    name: {
      type: String
    },
    data: {
      type: Object
    },
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

export default mongoose.model('Version', versionSchema, 'version')
