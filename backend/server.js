const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const movieRoutes = require("./routes/movieRoutes");
const initData = require("./utils/initData");
const authRoutes = require("./routes/authRoutes");
const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터 연결
app.use("/api", movieRoutes);
app.use("/api/auth", authRoutes);
// 서버 실행 및 DB 연결
const startServer = async () => {
  try {
    await sequelize.authenticate(); // DB 연결 확인

    // ⚠️ 중요: 인기도 컬럼 추가를 위해 이번만 force: true로 실행!
    // 데이터가 적재된 후에는 다시 force: false로 바꾸세요.
    await sequelize.sync({ force: true });
    console.log("💾 DB 연결 및 테이블 생성 성공!");

    // 📦 데이터 초기화 실행 (initData.js)
    // 테이블이 비어있으면 JSON 데이터를 DB에 넣습니다.
    await initData();

    app.listen(8080, () => {
      console.log("🚀 서버 가동 중: http://localhost:8080");
    });
  } catch (err) {
    console.error("❌ 서버 시작 실패:", err);
  }
};

startServer();
