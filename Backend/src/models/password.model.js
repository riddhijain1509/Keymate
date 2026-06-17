import mongoose,{Schema} from 'mongoose'

const passwordSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    websiteURL: {
      type: String,
      trim: true,
      required: true,
    },
    websiteName: {
      type: String,
      trim: true,
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
)

export const Password=mongoose.model('Password',passwordSchema);
