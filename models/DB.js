const users = []; // 실제 DB 대신 메모리에 저장

module.exports = {
  findByEmail(email) {
    return users.find(user => user.email === email);
  },
  create(user) {
    users.push(user);
  },
};
