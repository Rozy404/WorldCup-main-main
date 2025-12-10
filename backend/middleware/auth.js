const jwt = require("jsonwebtoken");

// 비밀키 (로그인할 때 썼던 거랑 똑같아야 함! .env 추천하지만 일단 하드코딩)
const JWT_SECRET = "은찬의아이";

const authMiddleware = (req, res, next) => {
  // 1. 헤더에서 토큰 꺼내기
  // 보통 "Bearer eyJhbGci..." 형식으로 옵니다.
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer" 떼고 토큰만

  if (!token) {
    return res.status(401).json({ error: "로그인이 필요합니다. (토큰 없음)" });
  }

  try {
    // 2. 토큰 검증 (위조되었거나 만료되었는지 확인)
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. 검증 성공! 요청(req)에 사용자 정보를 붙여서 다음 단계로 통과시킴
    req.user = decoded;
    next(); // "지나가세요!"
  } catch (err) {
    return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
};

module.exports = authMiddleware;
