const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  action: String, // 예: "병원 승인"
  targetHospital: mongoose.Schema.Types.ObjectId,
  performedBy: String, // 서버 관리자 이메일
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', adminLogSchema);