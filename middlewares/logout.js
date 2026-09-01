exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.error('로그아웃 실패:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.render('redirectWithAlert', {
            message: '로그아웃 되었습니다.',
            redirectUrl: '/'
        });
    });
}