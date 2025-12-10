const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 비밀키 (나중에 .env 파일로 빼는 게 좋습니다)
const JWT_SECRET = "은찬의아이";

// 1. 회원가입
exports.signup = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 이미 있는 이메일인지 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "이미 가입된 이메일입니다." });
    }

    // 비밀번호 암호화 (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickname,
    });

    res.status(201).json({ message: "회원가입 성공!", userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "회원가입 실패" });
  }
};

// 2. 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유저 찾기
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    // 비밀번호 확인 (암호화된 것끼리 비교)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    // 로그인 성공! -> 토큰(출입증) 발급
    // 유효기간: 1시간 (1h)
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "로그인 성공",
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "로그인 에러" });
  }
};
