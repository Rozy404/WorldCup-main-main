const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
// 주소 정의
router.post("/signup", authController.signup); // 회원가입
router.post("/login", authController.login); // 로그인

router.get("/me", authMiddleware, async (req, res) => {
  // 여기까지 왔다면 토큰 검증이 끝난 상태!
  // req.user 안에 로그인한 사람 정보가 들어있음
  res.json({
    message: "당신은 인증된 회원입니다!",
    user: req.user,
  });
});

module.exports = router;
