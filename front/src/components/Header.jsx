import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import "../styles/header.css";

export default function Header() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("현재 로그인 상태:", isLoggedIn);
    console.log("현재 유저 정보:", user);
  }, [isLoggedIn, user]);

  return (
    <header className="header">
      {/* 로고 */}
      <Link to="/" className="logo">
        MOVIE WORLD CUP 🎬
      </Link>

      <nav className="nav">
        <Link to="/rank" className="nav-link">
          랭킹 보기
        </Link>

        {isLoggedIn ? (
          <div className="user-section">
            <span>{user?.nickname}님</span>
            <button className="logout-btn" onClick={logout}>
              로그아웃
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setShowModal(true)}>
            로그인
          </button>
        )}
      </nav>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </header>
  );
}
