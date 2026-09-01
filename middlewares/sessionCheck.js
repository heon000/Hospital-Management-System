exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    // 세션이 만료되었거나 로그인 안 된 경우
    res.render('redirectWithAlert', {
      message: '로그인이 만료되었습니다. 로그인 페이지로 돌아갑니다.',
      redirectUrl: '/auth/login'
    });  
  }
}