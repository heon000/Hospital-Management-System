const User = require('../models/user');
const Hospital = require('../models/hospital');
const UpdateRequest = require('../models/hospitalUpdateRequest');
const HospitalDeleteLog = require('../models/hospitalDeleteLog');

// ✅ 소속 승인 요청 리스트 조회
exports.getPendingUsers = async (req, res) => {
  try {
    const hospitalId = req.session.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ error: '병원 ID가 필요합니다.' });
    }
    const users = await User.find({ hospitalId, hospitalApproved: false });
    res.json({users});
  } catch (err) {
    res.status(500).json({ error: '소속 승인 대기 조회 실패', details: err.message });
  }
};

// ✅ 소속 승인 처리
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await User.findByIdAndUpdate(userId, { hospitalApproved: true }, { new: true });
    if (!updated) return res.status(404).json({ error: '사용자 없음' });
    res.json({ message: '소속 승인 완료' });
  } catch (err) {
    res.status(500).json({ error: '소속 승인 실패', details: err.message });
  }
};

// ✅ 병원 정보 수정 요청
exports.requestHospitalUpdate = async (req, res) => {
  try {
    const { hospitalId, requestedBy, changes } = req.body;
    const updateReq = new UpdateRequest({ hospitalId, requestedBy, changes });
    await updateReq.save();
    res.json({ message: '병원 수정 요청이 제출되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '수정 요청 실패', details: err.message });
  }
};

// 병원 정보 수정 요청
exports.requestHospitalUpdate = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
    if (!user.hospitalId) return res.status(400).json({ error: '병원 정보가 없습니다.' });

    const { name, address, contact } = req.body;

    const updateReq = new UpdateRequest({
      hospitalId: user.hospitalId,
      requestedBy: user._id,
      changes: { name, address, contact }
    });

    await updateReq.save();
    res.json({ message: '병원 수정 요청이 제출되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '수정 요청 실패', details: err.message });
  }
};

// 병원 삭제 요청
exports.requestHospitalDelete = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
    if (!user.hospitalId) return res.status(400).json({ error: '병원 정보가 없습니다.' });

    const hospital = await Hospital.findById(user.hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: '병원을 찾을 수 없습니다.' });
    }

    const log = new HospitalDeleteLog({
      hospitalId: hospital._id,
      name: hospital.name,
      address: hospital.address,
      contact: hospital.contact,
      deletedBy: user._id,
      deleteApproved: false
    });

    await log.save();
    res.json({ message: '병원 삭제 요청이 제출되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '삭제 요청 실패', details: err.message });
  }
};