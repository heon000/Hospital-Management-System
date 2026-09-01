const Schedule = require('../models/schedule');
const Doctor = require('../models/user');
const Hospital = require('../models/hospital');
const moment = require('moment');
const mongoose = require('mongoose');
const Reservation = require('../models/reservation');
const sendSMS = require('../utils/twilio');
const reservationController = require('./reservation.controller');


// 현재 로그인한 의사의 스케줄 조회
exports.getCurrentDoctorSchedules = async (req, res) => {
    try {
        // 기본 의사 ID 사용 (실제로는 인증된 사용자의 ID를 사용해야 함)
        const doctorId = '507f1f77bcf86cd799439011'; // 임시 의사 ID
        
        // MongoDB 연결 확인
        if (!mongoose.connection.readyState) {
            console.error('MongoDB 연결이 없습니다.');
            return res.json([]);
        }

        // 스케줄 조회
        const schedules = await Schedule.find({ doctorId }).lean();
        console.log('조회된 스케줄:', schedules);

        // 스케줄이 없는 경우 빈 배열 반환
        if (!schedules || !Array.isArray(schedules)) {
            console.log('스케줄이 없거나 배열이 아님:', schedules);
            return res.json([]);
        }

        // 이벤트 데이터 변환
        const events = schedules.map(schedule => {
            try {
                const event = {
                    id: schedule._id ? schedule._id.toString() : '',
                    title: schedule.isHoliday ? '휴진' : '진료',
                    start: schedule.date || new Date(),
                    end: schedule.date || new Date(),
                    extendedProps: {
                        status: schedule.status || 'pending',
                        department: schedule.department || '',
                        availableTime: Array.isArray(schedule.availableTime) ? schedule.availableTime : []
                    }
                };
                console.log('변환된 이벤트:', event);
                return event;
            } catch (err) {
                console.error('스케줄 변환 오류:', err, schedule);
                return null;
            }
        }).filter(event => event !== null);

        console.log('최종 반환할 이벤트:', events);
        return res.json(events);
    } catch (err) {
        console.error('스케줄 조회 오류:', err);
        return res.json([]);
    }
};

// 스케줄 등록
exports.createSchedule = async (req, res) => {
    try {
        const { hospitalId, department, date, availableTime, isHoliday } = req.body;
        
        // doctorId를 프론트엔드에서 전달받은 값으로 사용
        const doctorId = req.body.doctorId;

        // 날짜 검증
        const scheduleDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        oneMonthLater.setHours(23, 59, 59, 999);

        if (scheduleDate < today || scheduleDate > oneMonthLater) {
            return res.status(400).json({
                error: "스케줄 날짜는 오늘부터 한 달 이내만 가능합니다."
            });
        }

        // 병원 정보 조회
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(400).json({ message: "병원 정보를 찾을 수 없습니다." });
        }

        // 저장
        const newSchedule = new Schedule({
            doctorId,
            hospitalId,
            department,
            date: scheduleDate,
            isHoliday,
            availableTime: isHoliday ? [] : availableTime,
            status: 'available'
        });

        const saved = await newSchedule.save();
        console.log('저장된 스케줄:', saved);
        res.status(201).json({ message: "✅ 스케줄 등록 완료", data: saved });
    } catch (err) {
        console.error('스케줄 등록 오류:', err);
        res.status(400).json({ error: err.message });
    }
};

// 특정 의사의 스케줄 조회
exports.getSchedulesByDoctor = async (req, res) => {
    try {
        const doctorObjectId = new mongoose.Types.ObjectId(req.params.doctorId);
        const schedules = await Schedule.find({ 
            doctorId: doctorObjectId,
            date: { $gte: new Date() }
        })
        .sort({ date: 1 })
        .populate('doctorId', 'name');
        
        const events = schedules.map(schedule => ({
            id: schedule._id,
            title: schedule.isHoliday ? '휴진' : '진료 가능',
            start: schedule.date,
            end: schedule.date,
            extendedProps: {
                status: schedule.status || (schedule.isHoliday ? 'unavailable' : 'available'),
                department: schedule.department,
                availableTime: schedule.availableTime
            }
        }));
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 병원별 스케줄 열람
exports.getSchedulesByHospital = async (req, res) => {
  try {
    const schedules = await Schedule.find({ hospitalId: req.params.hospitalId });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 전체 스케줄 조회
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({});
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ID로 스케줄 조회
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 스케줄 삭제
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
    }
    if (schedule.status !== 'available') {
      return res.status(400).json({ error: "예약 가능 상태에서만 삭제할 수 있습니다." });
    }
    await schedule.deleteOne();
    res.json({ message: "스케줄이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 스케줄 승인
exports.approveSchedule = async (req, res) => {
    console.log('[approveSchedule 호출됨]', req.params.id);
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
        }

        await reservationController.sendApprovalSMS(schedule._id);

        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 스케줄 취소
exports.cancelSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
        }

        const scheduleDate = new Date(schedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (scheduleDate <= today) {
            return res.status(400).json({ error: "당일 취소는 불가능합니다." });
        }

        schedule.status = 'cancelled';
        await schedule.save();
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 스케줄 상태 변경 (승인/거절)
exports.updateScheduleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
        }
        schedule.status = status;
        await schedule.save();
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};