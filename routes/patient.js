const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const {isLoggedIn } = require('../middlewares/sessionCheck');

// 전체 환자 목록 조회 (로그인 + 의료진/병원 관리자만)
router.get('/', patientController.getPatients);

router.get('/session', (req, res) => {
    console.log('session user:', req.session.user);
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
  }

  const user = req.session.user;

  // 병원 관리자, 의료진 등 역할에 따라 다르게 응답할 수 있음
  return res.json({
    hospitalId: user.hospitalId,
    doctorId: user._id
  });
});


// 특정 환자 정보 조회 
router.get('/:id', patientController.getPatientById);

// 환자 등록
router.post('/', patientController.createPatient);

// 환자 정보 수정
router.put('/:id', patientController.updatePatient);

// 환자 삭제
router.delete('/:id', patientController.deletePatient);


module.exports = router;