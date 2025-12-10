const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // 이메일 중복 금지
      validate: {
        isEmail: true, // 이메일 형식이 맞는지 검사
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // 가입일(created_at) 자동 기록
    tableName: "Users",
  }
);

module.exports = User;
