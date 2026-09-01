const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomController');


router.post('/init', (req, res) => controller.initRooms(req, res));
router.get('/:hospitalId', (req, res) => controller.getRooms(req, res));
router.post('/assign', (req, res) => controller.assignPatient(req, res));
router.post('/discharge', (req, res) => controller.dischargePatient(req, res));
router.get('/patient/search', (req, res) => controller.searchPatient(req, res));

module.exports = router;    
