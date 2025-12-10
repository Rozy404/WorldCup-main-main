const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    // 🌟 title -> name 으로 매핑해서 저장할 예정
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 🌟 poster_path -> img 로 매핑 (URL 풀주소 저장)
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 🌟 genre_ids -> genreIds 로 매핑
    genreIds: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // 🌟 [추가됨] 인기도 (랭킹용)
    popularity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // 🌟 [추가됨] 줄거리 (결과 페이지용)
    overview: {
      type: DataTypes.TEXT, // 긴 글이니까 TEXT
      allowNull: true,
    },
    // 🌟 [추가됨] 개봉일 (정보용)
    release_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    winCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    matchCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    tableName: "Movies",
  }
);

module.exports = Movie;
