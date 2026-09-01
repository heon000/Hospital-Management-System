const express = require('express');
const router = express.Router();
const {isLoggedIn } = require('../middlewares/sessionCheck');
const path = require('path');
const hasHospital = require('../middlewares/hasHospital');
const Hospital = require('../models/hospital');
const User = require('../models/user');


router.get('/', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id).populate('hospitalId');
  if (!user.hospitalId) return res.render('afterlogin'); // 병원 미등록자
  if (!user.hospitalApproved) return res.redirect('/afterlogin/pending'); // 미승인
  res.redirect('/afterlogin/rooms'); // 승인 완료된 병원
});

router.get('/rooms', isLoggedIn, hasHospital, (req, res) => {
  // 세션 체크 후 로그인 이후 화면 렌더링
  res.render('room');
  //res.sendFile(path.join(__dirname, '../public/room/index.html'));
});

router.post('/register-hospital', isLoggedIn, async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.session.user._id;

    const hospital = new Hospital({ name, address, approved: false });
    await hospital.save();

    await User.findByIdAndUpdate(userId, { hospitalId: hospital._id });

    console.log('병원 등록 완료:', hospital);
    res.redirect('/afterlogin/pending');
  } catch (err) {
    console.error('병원 등록 중 오류 발생:', err);
    res.status(500).send('서버 오류로 인해 병원 등록 실패');
  }
});

router.get('/pending', isLoggedIn, (req, res) => {
  res.render('pending');
});


module.exports = router;