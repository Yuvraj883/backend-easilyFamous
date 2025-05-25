const { Schema, model } = require('mongoose')
const { createHmac, randomBytes } = require('crypto')
const { generateToken } = require('../services/authServices')

const userSchema = Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default:
        'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
    },
    salt: {
      type: String,
    },
    token: {
      type: Number,
    },
    subscribed: {
      type: Boolean,
    },
  },
  { timestamps: true }
)

// Pre-save hook to hash the password
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  const salt = randomBytes(16).toString('hex')
  const hashedPassword = createHmac('sha256', salt)
    .update(this.password)
    .digest('hex')
  this.salt = salt
  this.password = hashedPassword
  next()
})

// Static method to match password and generate token
userSchema.static(
  'matchPasswordAndGenerateToken',
  async function (email, password) {
    const user = await this.findOne({ email })
    if (!user) {
      throw new Error("User doesn't exist")
    }

    const hashedPassword = createHmac('sha256', user.salt)
      .update(password)
      .digest('hex')
    if (hashedPassword !== user.password) {
      throw new Error('Wrong password')
    }

    const token = generateToken(user)
    return token
  }
)

const User = model('User', userSchema)
module.exports = User
