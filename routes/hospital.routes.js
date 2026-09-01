const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');

router.get('/', hospitalController.getHospitals); // 전체
router.get('/search', hospitalController.searchHospitals); // 검색
router.get('/:id', hospitalController.getHospitalById); // 상세

module.exports = router;