const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  department: { type: String, required: true },
  date: { type: Date, required: true },
  isHoliday: { type: Boolean, default: false },
  availableTime: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true }
    }
  ],
  status: { 
    type: String, 
    enum: ['available', 'pending', 'approved', 'cancelled'],
    default: 'available'
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);