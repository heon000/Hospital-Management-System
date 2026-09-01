exports.ensureServerAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    // 이전 페이지로 돌아가기 + 경고창 띄우기
    res.send(`
      <script>
        alert('관리자 권한이 없습니다.');
        history.back();
      </script>
    `);
  }
};

exports.ensureManager = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'manager') {
    next();
  } else {
    // 이전 페이지로 돌아가기 + 경고창 띄우기
    res.send(`
      <script>
        alert('병원 관리자 권한이 없습니다.');
        history.back();
      </script>
    `);
  }
};