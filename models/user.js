const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['patient', 'doctor', 'manager', 'admin'],
        required: true, 
    },
    hospitalId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hospital', 
      default: null 
    },
    hospitalApproved: { 
      type: Boolean, 
      default: false 
    },
}, { timestamps: true});

// 저장 전에 비밀번호 암호화
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // 비밀번호가 수정된 경우만 암호화
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 비밀번호 비교 함수 (로그인 시 사용)
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);