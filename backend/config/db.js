const { Sequelize } = require("sequelize");

// 비밀번호 꼭 확인하세요!
const sequelize = new Sequelize("worldcup", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
