const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  patients: {
    type: [String], // 환자 이름 목록
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);