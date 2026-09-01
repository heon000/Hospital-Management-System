//  patientChart.js - 환자 정보 스키마 정의
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthdate: { type: Date, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  medicalRecords: [
    {
      date: { type: Date, required: true },
      symptoms: String,
      diagnosis: String,
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }
  ],
  /*accessRequests: [
    {
      requestingDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approved: { type: Boolean, default: false }
    }
  ]*/
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
