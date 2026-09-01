const Hospital = require('../models/hospital');

// 모든 등록된 병원 목록
exports.getHospitals = async (req, res) => {
  const hospitals = await Hospital.find({ approved: true });
  res.json(hospitals);
};

// 병원 검색 (이름/주소)
exports.searchHospitals = async (req, res) => {
  const { keyword } = req.query;
  const condition = keyword
    ? { approved: true, $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { address: { $regex: keyword, $options: 'i' } }
        ]}
    : { approved: true };
  const hospitals = await Hospital.find(condition);
  res.json(hospitals);
};

// 병원 상세 정보
exports.getHospitalById = async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital || !hospital.approved) {
    return res.status(404).json({ error: '등록되지  병원입니다.' });
  }
  res.json(hospital);
};