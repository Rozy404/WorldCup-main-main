import { createContext, useState, useEffect } from "react";
// import api from "../api/axios"; // 지금은 안 쓰지만 나중에 토큰 검증할 때 필요할 수 있음

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 유저 정보 (닉네임 등)
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [loading, setLoading] = useState(true);

  // 1. 새로고침 시 토큰 + 유저 정보 복구하기 🌟 [수정됨]
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user"); // 저장된 유저 정보 가져오기

    if (token) {
      setIsLoggedIn(true);

      if (storedUser) {
        try {
          // 문자열로 저장된 객체를 다시 JSON으로 변환해서 상태에 저장
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("유저 정보 파싱 실패", e);
          localStorage.removeItem("user"); // 데이터가 깨졌으면 삭제
        }
      }
    }
    setLoading(false);
  }, []);

  // 2. 로그인 함수 🌟 [수정됨]
  const login = (token, userData) => {
    localStorage.setItem("token", token);

    // 🚨 핵심: 유저 정보도 문자열로 바꿔서 저장해야 새로고침해도 기억합니다!
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsLoggedIn(true);
  };

  // 3. 로그아웃 함수 🌟 [수정됨]
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // 유저 정보도 같이 삭제해야 함

    setUser(null);
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
