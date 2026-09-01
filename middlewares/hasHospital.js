const User = require('../models/user');

const hasHospital = async (req, res, next) => {
  try {
    const userId = req.session.user?._id;

    if (!userId) {
        res.render('redirectWithAlert', {
            message: '로그인이 만료되었습니다. 로그인 페이지로 돌아갑니다.',
            redirectUrl: '/auth/login'
        });
    }
    const user = await User.findById(userId);

    if (!user || !user.hospitalId) {
       res.render('redirectWithAlert', {
            message: '소속 병원이 없습니다. 승인 후 이용해주세요.',
            redirectUrl: '/doctor'
        });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: '병원 확인 실패', details: err.message });
  }
};

module.exports = hasHospital;