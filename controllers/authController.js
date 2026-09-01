const User = require('../models/user');
const bcrypt = require('bcrypt');
const  { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/mailer');

//난수 생성
function generateCodes() {
    return Math.floor(100000 + Math.random()*900000).toString();
}

const tempEmailCodes = {};

//이메일 인증 처리
exports.sendEmailCode = async ( req, res) => {
    const { email } = req.body;
    const code = generateCodes();
    const expireAt = new Date(Date.now() + 3*60*1000); //3분 후 만료

    tempEmailCodes[email] = { code, expireAt };

    try {
        await sendEmail(email, code);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: '이메일 전송 실패'});
    }
};

exports.verifyEmailCode = (req, res) => {
    const { email, code } = req.body;
    const stored = tempEmailCodes[email];

    if (!stored) return res.json({success: false, message: '인증 요청이 없습니다.'});
    
    if (new Date() > stored.expireAt) {
        delete tempStorage[email];
        return res.josn({ success: false, message: '만료된 인증번호 입니다.'});
    }

    if(stored.code !== code) {
        return res.json({ success: false, message: '인증번호가 일치하지 않습니다' });
    }

    req.session.emailVerified = email;
    delete tempEmailCodes[email];
    return res.json({ success: true });
};


//회원가입 화면
exports.showRegisterForm = (req, res) => {
    res.render('signup');
};

//회원가입 처리
exports.handleRegister = async (req, res) => {
    console.log('폼 데이터:', req.body);
    const { name, email, password } = req.body;
    
    if (!email.endsWith('@gmail.com')) {
        return res.render('signup', { error: '병원 이메일(지메일)만 가입할 수 있습니다.'});
    }
    if (req.session.emailVerified !== email) {
        return res.render('signup', { error: '이메일 인증을 완료해주세요.'});
    }
    if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return res.render('signup', { error: '비밀번호는 영문+숫자 포함 6자 이상이어야 합니다.'});
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.render('signup', { error: '이미 등록된 이메일입니다.' });
    }

    const newUser = new User({ name, email, password, role: 'doctor' });
    await newUser.save();

    console.log('가입 성공:', email);

    res.render('redirectWithAlert', {
    message: '회원가입이 완료되었습니다!',
    redirectUrl: '/'
    });
};

//로그인 화면
exports.showLoginForm = (req, res) => {
    if (req.session.user) {
        res.render('redirectWithAlert', {
        message: '이미 로그인 정보가 있습니다.',
        redirectUrl: '/afterlogin/rooms'
        })
    }   
    res.render('login');
};

//로그인 처리
exports.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.render('login', { error: '이메일 또는 비밀번호가 틀렸습니다.'});
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.render('login', { error: '이메일 또는 비밀번호가 틀렸습니다.'});
    }

    req.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
    };

    if (user.role === 'admin') {
        req.session.user = user;
        return res.render('redirectWithAlert', {
            message: '서버 관리자 로그인 성공',
            redirectUrl: '/admin'
        });
    }

    if (user.role === 'manager') {
        req.session.user = user;
        return res.render('redirectWithAlert', {
            message: '병원 관리자 로그인 성공',
            redirectUrl: '/afterlogin'
        });
    }

    console.log('로그인 성공:', email);

    req.session.user = user; //세션저장

    res.render('redirectWithAlert', {
    message: '로그인이 완료되었습니다!',
    redirectUrl: '/doctor'
    });
};