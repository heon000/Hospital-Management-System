const { exec } = require('child_process');
const path = require('path');

/**
 * 지정된 백업 폴더에서 MongoDB 복구
 * @param {string} backupFolderName - ex) "backup-2025-06-10T02-00-00"
 */
function restoreBackupByName(backupFolderName, callback) {
  const backupPath = path.resolve(__dirname, '..', 'db_backups', backupFolderName);
  const cmd = `mongorestore --drop --uri="mongodb://localhost:27017/your-db-name" "${backupPath}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`[복구 실패] ${stderr}`);
      callback(false, stderr);
    } else {
      console.log(`[복구 성공] ${backupPath}`);
      callback(true, stdout);
    }
  });
}

module.exports = { restoreBackupByName };
