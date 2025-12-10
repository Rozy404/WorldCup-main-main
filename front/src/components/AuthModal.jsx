// src/components/AuthModal.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function AuthModal({ onClose }) {
  const { login } = useContext(AuthContext);
  const [isSignup, setIsSignup] = useState(false); // false면 로그인, true면 회원가입
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        // 회원가입 요청
        await api.post("/auth/signup", form);
        alert("회원가입 성공! 로그인을 해주세요.");
        setIsSignup(false); // 로그인 화면으로 전환
      } else {
        // 로그인 요청
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        // 성공 시 Context의 login 함수 호출 (토큰 저장)
        login(res.data.token, res.data.user);
        alert("환영합니다! 🎬");
        onClose(); // 모달 닫기
      }
    } catch (err) {
      console.error(err);
      setError("입력 정보를 확인해주세요.");
    }
  };

  // 간단한 모달 스타일
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  const contentStyle = {
    backgroundColor: "#222",
    padding: "40px",
    borderRadius: "10px",
    width: "400px",
    color: "white",
    textAlign: "center",
    border: "1px solid #444",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "white",
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>{isSignup ? "회원가입" : "로그인"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
          />

          {isSignup && (
            <input
              name="nickname"
              placeholder="닉네임"
              value={form.nickname}
              onChange={handleChange}
              style={inputStyle}
            />
          )}

          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <button
            type="submit"
            style={{
              ...inputStyle,
              backgroundColor: "#e50914",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isSignup ? "가입하기" : "로그인하기"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px", color: "#aaa" }}>
          {isSignup ? "이미 계정이 있으신가요? " : "아직 계정이 없으신가요? "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{
              color: "#fff",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {isSignup ? "로그인" : "회원가입"}
          </span>
        </p>
      </div>
    </div>
  );
}
