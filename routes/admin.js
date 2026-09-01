const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureServerAdmin } = require('../middlewares/auth');
const path = require('path');

const Hospital = require('../models/hospital');
const HospitalAdminRequest = require('../models/hospitalAdminRequest');
const HospitalDeleteLog = require('../models/hospitalDeleteLog');
const HospitalUpdateRequest = require('../models/hospitalUpdateRequest');
const { restoreBackupByName } = require('../utils/restore');

router.use(ensureServerAdmin);


router.get('/', (req, res) => {
  res.render('admin');
});

// 병원 전체 조회
router.get('/hospitals', adminController.getAllHospitals);

// 승인된 병원 조회
router.get('/approved-hospitals', adminController.getApprovedHospitals);

// 병원 등록 승인
router.patch('/hospitals/:id/approve', adminController.approveHospital);

// 병원 수정 요청 전체 조회
router.get('/update-requests', adminController.getUpdateRequests);

// 병원 수정 요청 승인
router.patch('/update-requests/:requestId/approve', adminController.approveUpdateRequest);

// 병원 수정 요청 거절
router.delete('/update-requests/:requestId/reject', adminController.rejectUpdateRequest);

// 병원 관리자 신청 목록 조회
router.get('/admin-requests', adminController.getAdminRequests);

// 병원 관리자 신청 승인
router.patch('/admin-requests/:requestId/approve', adminController.approveAdminRequest);

// 병원 관리자 신청 거절
router.delete('/admin-requests/:requestId/reject', adminController.rejectAdminRequest);

// 삭제 이력 전체 조회
router.get('/deleted-logs', adminController.getDeletedLogs);

// 삭제 이력 승인 처리
router.patch('/delete-logs/:logId/approve', adminController.approveDeleteLog);

// 삭제 이력 거절 (문서 삭제)
router.delete('/delete-logs/:logId/reject', adminController.rejectDeleteLog);

// POST /admin/restore
router.post('/restore', ensureServerAdmin, (req, res) => {
  const { backupFolderName } = req.body;

  if (!backupFolderName) {
    return res.status(400).json({ success: false, message: '백업 폴더명이 필요합니다' });
  }

  restoreBackupByName(backupFolderName, (success, output) => {
    if (success) {
      res.json({ success: true, message: '복구 성공', output });
    } else {
      res.status(500).json({ success: false, message: '복구 실패', error: output });
    }
  });
});


module.exports = router;