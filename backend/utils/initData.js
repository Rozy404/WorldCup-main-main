const Movie = require("../models/Movie");
const movieData = require("../data/movie_data.json");

const initData = async () => {
  try {
    const count = await Movie.count();
    if (count === 0) {
      console.log("📦 데이터가 없어서 적재를 시작합니다...");
      await Movie.bulkCreate(movieData, { ignoreDuplicates: true });
      console.log("✅ 영화 데이터 적재 완료!");
    } else {
      console.log("👍 데이터가 이미 준비되어 있습니다.");
    }
  } catch (err) {
    console.error("❌ 데이터 적재 에러:", err);
  }
};

module.exports = initData;
