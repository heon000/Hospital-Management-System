require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const afterLoginRouter = require('./routes/afterlogin');
const roomRouter = require('./routes/room');
const adminRouter = require('./routes/admin');
const managerRouter = require('./routes/manager');
const doctorRouter = require('./routes/doctor');
const patientRouter = require('./routes/patient');
const hospitalRouter = require('./routes/hospital.routes');
const scheduleRouter = require('./routes/schedule.routes');
const userRouter = require('./routes/user.routes');
const reservationRouter = require('./routes/reservation.routes');
require('./utils/backup'); // 자동 백업 스케줄러 실행
const smsRouter = require('./routes/sms');



module.exports = function () {
  const app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET, 
    cookie: { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300000 } // 세션유지 시간
  }));
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  app.use(flash());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/auth', authRouter);
  app.use('/afterlogin', afterLoginRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/admin',adminRouter);
  app.use('/manager',managerRouter);
  app.use('/doctor', doctorRouter);
  app.use('/api/patient', patientRouter);
  app.use('/api/hospitals', hospitalRouter);
  app.use('/api/schedules', scheduleRouter);
  app.use('/api/users', userRouter);
  app.use('/api/reservations', reservationRouter);
  app.use('/sms', smsRouter);





  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}