const Room = require('../models/room');

module.exports = {
  // 병실 초기화 및 전체 병실 정보 반환
  initRooms: async (req, res) => {
    const { hospitalId, floorCount, roomPerFloor, capacity } = req.body;

    if (!hospitalId || !floorCount || !roomPerFloor || !capacity) {
      return res.status(400).json({ error: '필수값 누락' });
    }

    // 기존 병실 삭제
    await Room.deleteMany({ hospitalId });

    // 새 병실 생성
    const rooms = [];
    for (let floor = 1; floor <= floorCount; floor++) {
      for (let r = 1; r <= roomPerFloor; r++) {
        const roomNum = floor * 100 + r;
        rooms.push({
          hospitalId,
          floor,
          roomNumber: `${roomNum}`,
          capacity,
          patients: [],
        });
      }
    }

    await Room.insertMany(rooms);

    const inserted = await Room.find({ hospitalId }).sort({ floor: 1, roomNumber: 1 });
    res.json({ rooms : inserted, count: inserted.length });
  },

  // 병실 조회
  getRooms: async (req, res) => {
    const hospitalId = req.params.hospitalId;
    const rooms = await Room.find({ hospitalId }).sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  },

  // 환자 검색
  searchPatient: async (req, res) => {
    const { hospitalId, name } = req.query;
    if (!hospitalId || !name) return res.status(400).json({ error: '검색 조건 부족' });

    const room = await Room.findOne({
      hospitalId,
      patients: name,
    });

    if (!room) return res.json({ found: false });
    res.json({ found: true, roomNumber: room.roomNumber });
  },

  // 입원
  assignPatient: async (req, res) => {
    const { hospitalId, roomNumber, patientName } = req.body;

    const room = await Room.findOne({ hospitalId, roomNumber });
    if (!room) return res.status(404).json({ error: '병실 없음' });
    if (room.patients.length >= room.capacity) return res.status(400).json({ error: '정원 초과' });

    room.patients.push(patientName);
    room.lastUpdated = new Date();
    await room.save();

    res.json({ status: '입원 완료' });
  },

  // 퇴원
  dischargePatient: async (req, res) => {
    const { hospitalId, roomNumber, patientName } = req.body;

    const room = await Room.findOne({ hospitalId, roomNumber });
    if (!room) return res.status(404).json({ error: '병실 없음' });

    const index = room.patients.indexOf(patientName);
    if (index === -1) return res.status(400).json({ error: '환자 없음' });

    room.patients.splice(index, 1);
    room.lastUpdated = new Date();
    await room.save();

    res.json({ status: '퇴원 완료' });
  },
};