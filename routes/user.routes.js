const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user.controller");
const User = require("../models/user");

// 병원 ID로 해당 병원 소속 의사 조회
router.get("/doctors/:hospitalid", userCtrl.getDoctorsByHospital);

// 병원 ID와 role로 사용자(의사) 목록 조회
router.get('/', async (req, res) => {
  const { hospitalId, role } = req.query;
  const filter = {};
  if (hospitalId) filter.hospitalId = hospitalId;
  if (role) filter.role = role;
  try {
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '의료진 조회 실패' });
  }
});

module.exports = router;