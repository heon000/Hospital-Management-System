const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  patientName: { type: String },
  phoneNumber: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  reservedTime: String,
  status: { type: String, default: '신청' } // 신청, 승인, 취소 등
});

module.exports = mongoose.model('Reservation', reservationSchema);