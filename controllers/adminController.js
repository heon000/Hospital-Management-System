const express = require('express');
const router = express.Router();

const Hospital = require('../models/hospital');
const UpdateRequest = require('../models/hospitalUpdateRequest');
const HospitalDeleteLog = require('../models/hospitalDeleteLog');
const AdminRequest = require('../models/hospitalAdminRequest');
const User = require('../models/user');

//전체 병원 조회
exports.getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ error: '병원 목록 조회 실패', details: err.message});
    }
};

// 승인된 병원 조회
exports.getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ approved: true });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: '등록 병원 목록 조회 실패', details: err.message });
  }
};

// 병원 승인 및 병원 최초 등록자 병원 관리자 자동 연결
exports.approveHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findByIdAndUpdate(id, { approved: true }, { new: true });
    if (!hospital) {
      return res.status(404).json({ message: '해당 병원을 찾을 수 없습니다.' });
    }

    const user = await User.findOne({ hospitalId: id });
    if (user) {
      user.hospitalApproved = true;
      await user.save();    
    }

    res.json({ message: '병원이 승인되었고 관리자가 병원에 연결되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '병원 승인 처리 실패', details: err.message });
  }
};

// 병원 수정 요청 전체 조회
exports.getUpdateRequests = async (req, res) => {
  try {
    const requests = await UpdateRequest.find({approved: false}).populate('hospitalId');
    const merged = requests.map(r => ({
      _id: r._id,
      hospital: r.hospitalId,
      changes: r.changes,
    }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: '수정 요청 조회 실패', details: err.message });
  }
};

// 병원 수정 요청 승인
exports.approveUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await UpdateRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: '수정 요청 없음' });

    await Hospital.findByIdAndUpdate(request.hospitalId, request.changes);
    request.approved = true;
    await request.save();

    res.json({ message: '병원 정보 수정 완료' });
  } catch (err) {
    res.status(500).json({ error: '수정 승인 실패', details: err.message });
  }
};

// 병원 수정 요청 거절
exports.rejectUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await UpdateRequest.findByIdAndDelete(requestId);
    res.json({ message: '수정 요청이 거절되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '수정 거절 실패', details: err.message });
  }
};

// 병원 관리자 신청 목록 조회
exports.getAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({ status: 'pending' }).populate('userId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: '관리자 신청 목록 조회 실패', details: err.message });
  }
};

// 병원 관리자 신청 승인
exports.approveAdminRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await AdminRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: '관리자 요청 없음' });

    request.status = 'approved';
    await request.save();

    await User.findByIdAndUpdate(request.userId, { role: 'manager' });

    res.json({ message: '병원 관리자로 승인되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '관리자 승인 실패', details: err.message });
  }
};

// 병원 관리자 신청 거절
exports.rejectAdminRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await AdminRequest.findByIdAndDelete(requestId);
    res.json({ message: '관리자 신청이 거절되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '거절 실패', details: err.message });
  }
};

// 삭제 이력 전체 조회
exports.getDeletedLogs = async (req, res) => {
  try {
    const logs = await HospitalDeleteLog.find().sort({ deletedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: '삭제 이력 조회 실패', details: err.message });
  }
};

// 삭제 이력 승인 처리
exports.approveDeleteLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const updated = await HospitalDeleteLog.findByIdAndUpdate(logId, { deleteApproved: true }, { new: true });
    res.json({ message: '삭제 이력이 승인되었습니다.', log: updated });
  } catch (err) {
    res.status(500).json({ error: '삭제 승인 실패', details: err.message });
  }
};

// 삭제 이력 거절 (문서 삭제)
exports.rejectDeleteLog = async (req, res) => {
  try {
    const { logId } = req.params;
    await HospitalDeleteLog.findByIdAndDelete(logId);
    res.json({ message: '삭제 요청이 거절되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '삭제 거절 실패', details: err.message });
  }
};