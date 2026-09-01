const mongoose = require('mongoose');

// 병원 삭제 이력 스키마
const deleteLogSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }, // 삭제된 병원 ID
  name: String,      // 삭제 당시 병원명 (스냅샷)
  address: String,   // 삭제 당시 주소
  contact: String,   // 삭제 당시 연락처
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // 삭제 요청자
  deleteApproved: { type: Boolean, default: false }  // 삭제 승인 여부 (서버관리자 승인 추가)
}, { timestamps: { createdAt: 'deletedAt' } });  // 삭제일 기록

// ✅ OverwriteModelError 방지용 선언
module.exports = mongoose.models.HospitalDeleteLog || mongoose.model('HospitalDeleteLog', deleteLogSchema);
