const mongoose = require('mongoose');

async function connectMongoose() {
  const mongoUri = 'mongodb://localhost:27017/hospitalDB';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Mongoose 연결 성공');
  } catch (error) {
    console.error('❌ Mongoose 연결 실패:', error);
    process.exit(1);
  }
}

module.exports = connectMongoose;