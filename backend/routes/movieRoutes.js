const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// 1. 게임 후보 뽑기
router.get("/movies", movieController.getCandidates);

// 2. 결과 저장
router.post("/movies/result", movieController.saveResult);

// 🌟 [추가됨] 3. 장르별 1위 조회 (순서 중요: /ranks 보다 위에!)
router.get("/ranks/genre-tops", movieController.getGenreTops);

// 4. 랭킹 조회
router.get("/ranks", movieController.getRanks);

// 5. 추천 영화
router.get("/game/recommend", movieController.getRecommendations);

module.exports = router;
