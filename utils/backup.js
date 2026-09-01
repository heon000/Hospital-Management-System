const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const backupDir = path.join(__dirname, '..', 'db_backups');

// 디렉토리 없으면 생성
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 매일 새벽 2시에 실행
cron.schedule('0 2 * * *', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  const cmd = `mongodump --uri="mongodb://localhost:27017/your-db-name" --out="${backupPath}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`[백업 실패] ${stderr}`);
    } else {
      console.log(`[백업 성공] ${backupPath}`);
    }
  });
});

console.log('[백업 스케줄러] 매일 새벽 2시에 MongoDB 자동 백업 실행됨');
