const mongoose = require('mongoose');

// 병원 정보 수정 요청 스키마
const updateRequestSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }, // 수정 대상 병원
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    // 요청자
  changes: { type: Object, required: true }, // 변경 요청 내용 (name, address, contact 포함)
  approved: { type: Boolean, default: false } // 서버관리자 승인 여부
}, { timestamps: true });  // 요청일시 기록

// ✅ OverwriteModelError 방지용 선언
module.exports = mongoose.models.HospitalUpdateRequest || mongoose.model('HospitalUpdateRequest', updateRequestSchema);
