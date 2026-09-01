const User = require('../models/user');

exports.getDoctorsByHospital = async (req, res) => {
  const hospitalId = req.params.hospitalId;
  try {
    const doctors = await User.find({ role: "doctor", hospitalId: hospitalId });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "의료진 불러오기 실패" });
  }
};