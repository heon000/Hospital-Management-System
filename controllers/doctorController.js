const mongoose = require('mongoose');
const User = require('../models/user');
const AdminRequest = require('../models/hospitalAdminRequest');
const Hospital = require('../models/hospital');

exports.getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ approved: true });
    const hospitalIdsWithManager = await User.distinct('hospitalId', { role: 'manager' });
    const filtered = hospitals.filter(h =>
      hospitalIdsWithManager.map(id => id.toString()).includes(h._id.toString())
    );
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: '병원 목록 조회 실패', details: err.message });
  }
};

exports.selectHospital = async (req, res) => {
  try {
    const { hospitalId } = req.body;
    const userId = req.params.id;
    const updated = await User.findByIdAndUpdate(userId, {
      hospitalId,
      hospitalApproved: false
    }, { new: true });
    if (!updated) return res.status(404).json({ error: '사용자 없음' });
    res.json({ message: '소속 병원 신청 완료', user: updated });
  } catch (err) {
    res.status(500).json({ error: '소속 신청 실패', details: err?.message || err });
  }
};

exports.cancelHospital = async (req, res) => {
  try {
    const userId = req.params.id;
    const updated = await User.findByIdAndUpdate(userId, {
      hospitalId: null,
      hospitalApproved: false
    }, { new: true });
    if (!updated) return res.status(404).json({ error: '사용자 없음' });
    res.json({ message: '소속 신청이 취소되었습니다.', user: updated });
  } catch (err) {
    res.status(500).json({ error: '소속 신청 취소 실패', details: err?.message || err});
  }
};

exports.requestAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(objectUserId);
    if (!user) return res.status(404).json({ error: '사용자 없음' });
    if (user.hospitalRole === 'manager') {
      return res.status(400).json({ error: '이미 병원 관리자입니다.' });
    }
    const existing = await AdminRequest.findOne({ userId: objectUserId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ error: '이미 관리자 신청 중입니다.' });
    }
    const request = new AdminRequest({ 
      userId: objectUserId,
      email: req.session.user.email,
      status: 'pending' 
    });
    await request.save();
    res.status(201).json({ message: '병원 관리자 신청이 제출되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '관리자 신청 실패', details: err.message });
  }
};

exports.getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('hospitalId');
    if (!user) return res.status(404).json({ error: '사용자 없음' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: '내 정보 조회 실패', details: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '전체 사용자 조회 실패', details: err.message });
  }
};
