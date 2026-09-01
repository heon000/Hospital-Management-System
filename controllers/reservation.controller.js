const Reservation = require('../models/reservation');
const Schedule = require('../models/schedule');
const Hospital = require('../models/hospital');
const { sendSMS } = require('../utils/twilio');

// 예약 신청
exports.createReservation = async (req, res) => {
  const { patientId, patientName, phoneNumber, hospitalId, doctorId, scheduleId, reservedTime } = req.body;
  console.log('서버에서 받은 hospitalId:', hospitalId);
  console.log('서버에서 받은 scheduleId:', scheduleId);

  // 병원, 스케줄 유효성 체크
  const hospital = await Hospital.findById(hospitalId);
  console.log('DB에서 찾은 hospital:', hospital);
  if (!hospital || !hospital.approved) {
    return res.status(400).json({ error: '등록되지 않은 병원입니다.' });
  }
  const schedule = await Schedule.findById(scheduleId);
  console.log('DB에서 찾은 schedule:', schedule);
  if (!schedule) {
    return res.status(400).json({ error: '해당 의료진의 스케줄이 없습니다. 예약 불가.' });
  }
  // (추가: 예약 가능 시간인지 체크해도 됨)

  const newReservation = new Reservation({ patientId, patientName, phoneNumber, hospitalId, doctorId, scheduleId, reservedTime });
  const saved = await newReservation.save();

  // 예약이 들어온 스케줄의 상태를 'pending'으로 변경
  schedule.status = 'pending';
  await schedule.save();
  
  res.status(201).json(saved);
};

exports.sendApprovalSMS = async (scheduleId) => {
  console.log('[sendApprovalSMS 호출됨]', scheduleId);
    try {
        const reservation = await Reservation.findOne({ scheduleId });

        if (!reservation) {
            console.log('[예약 없음] 해당 스케줄에 연결된 예약이 없습니다.');
            return;
        }

        const correctNum = '+8210' + reservation.phoneNumber;
        await sendSMS({
            to: correctNum,
            message:`안녕하세요, ${reservation.patientName || '환자'}님. 예약이 승인되었습니다. 예약 시간: ${reservation.reservedTime}`
        });

        console.log('[문자 전송 완료] 승인 문자 전송됨');
    } catch (err) {
        console.error('[문자 전송 실패]', err.message);
    }
};