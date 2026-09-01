const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const {isLoggedIn } = require('../middlewares/sessionCheck');
const User = require('../models/user');

router.get('/', isLoggedIn, async (req, res) => {
    const user = req.session.user;

    try {
        const dbUser = await User.findById(user._id);

        if (dbUser && dbUser.hospitalId && dbUser.hospitalApproved) {
            return res.redirect('/afterlogin/rooms');
        }

        res.render('doctor', {userId: dbUser._id});

    } catch (err){
        console.error('doctor 페이지 에러:', err);
        res.status(500).send('서버 오류');
    }
});


// 승인된 병원 목록 (관리자 있는 병원만)
router.get('/hospitals/approved', doctorController.getApprovedHospitals);

// 소속 병원 신청 / 취소
router.post('/:id/select-hospital', doctorController.selectHospital);
router.post('/:id/cancel-hospital', doctorController.cancelHospital);

// 병원 관리자 신청
router.post('/request-admin', doctorController.requestAdmin);

// 내 정보 조회
router.get('/:id/my-info', doctorController.getMyInfo);

// 전체 사용자 조회
router.get('/all', doctorController.getAllUsers);

module.exports = router;