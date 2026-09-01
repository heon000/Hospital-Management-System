const Patient = require('../models/patients'); // 친구 환자 모델 그대로
const Room = require('../models/room');       // 병실 모델 (필요시)
const mongoose = require('mongoose');

// 환자 목록 조회
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    next(err);
  }
};

// 특정 환자 조회
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id); //
    if (!patient) return res.status(404).json({ message: '환자 없음' });
/*
    const isSameHospital = req.user?.hospitalId.toString() === patient.hospitalId.toString();
    const hasApproval = patient.accessRequests?.some(r => r.requestingDoctorId.toString() === req.user._id.toString() && r.approved);

    if (!isSameHospital && !hasApproval) {
      return res.status(403).json({ message: '접근 권한 없음' });
    }*/

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

// 새 환자 등록
exports.createPatient = async (req, res, next) => {
  try {
    const { name, birthdate, hospitalId, medicalRecords } = req.body;

    const newPatient = new Patient({
      name,
      birthdate,
      hospitalId, 
      medicalRecords,
    });

    await newPatient.save();

    res.status(201).json(newPatient);
  } catch (err) {
    next(err);
  }
};

// 환자 정보 수정
exports.updatePatient = async (req, res, next) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: '수정 대상 없음' });
    res.json({ message: '수정 완료', data: updated });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err.message });
  }
};

// 환자 삭제
exports.deletePatient = async (req, res, next) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: '삭제 대상 없음' });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
  }
};