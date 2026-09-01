const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

// 병원별 스케줄 열람
router.get('/hospital/:hospitalId', scheduleController.getSchedulesByHospital);

// 현재 로그인한 의사의 스케줄 조회
router.get('/doctor/current', scheduleController.getCurrentDoctorSchedules);

// 의료진별 스케줄 열람
router.get('/doctor/:doctorId', scheduleController.getSchedulesByDoctor);

// 스케줄 등록
router.post('/', scheduleController.createSchedule);

// 전체 조회
router.get('/', scheduleController.getSchedules);

// ID로 조회
router.get('/:id', scheduleController.getScheduleById);

// 삭제
router.delete('/:id', scheduleController.deleteSchedule);

// 승인
router.patch('/:id/status', scheduleController.approveSchedule);

// 취소(당일 취소불가)
router.patch('/cancel/:id', scheduleController.cancelSchedule);

// 상태 변경 (승인/거절)
router.patch('/:id/status', scheduleController.updateScheduleStatus);

module.exports = router;
