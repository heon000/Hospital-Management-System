const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { ensureManager } = require('../middlewares/auth'); // 관리자 권한 체크


router.use(ensureManager);

router.get('/', (req, res) => {
  res.render('manager');
});

// 소속 승인 요청 리스트 조회
router.get('/pending-users', managerController.getPendingUsers);

// 소속 승인 처리
router.patch('/approve-user/:userId', managerController.approveUser);

// 병원 정보 수정 요청
router.post('/update-hospital', managerController.requestHospitalUpdate);

// 병원 삭제 요청
router.post('/delete-hospital', managerController.requestHospitalDelete);

module.exports = router;