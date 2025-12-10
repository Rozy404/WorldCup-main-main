import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/home.css"; // ⭐ CSS 분리된 파일

export default function Home() {
  const navigate = useNavigate();
  const [round, setRound] = useState(16);

  const defaultGenres = [
    { id: "ALL", name: "전체 랜덤" },
    { id: 28, name: "액션" },
    { id: 10749, name: "로맨스" },
    { id: 35, name: "코미디" },
    { id: 27, name: "공포" },
    { id: 878, name: "SF / 판타지" },
    { id: 16, name: "애니메이션" },
    { id: 18, name: "드라마" },
    { id: 80, name: "범죄" },
  ];

  const [genreData, setGenreData] = useState(defaultGenres);

  useEffect(() => {
    api
      .get("/ranks/genre-tops")
      .then((res) => {
        if (res.data.data && res.data.data.length > 0) {
          setGenreData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
      });
  }, []);

  const handleStartGame = (selectedGenre) => {
    navigate("/game", { state: { round, genre: selectedGenre } });
  };

  const handleViewRank = (selectedGenre) => {
    navigate(`/rank?genre=${selectedGenre}&sort=winRate`);
  };

  return (
    <div className="home-container">
      <h1 className="title">🎬 MOVIE WORLD CUP</h1>
      <p className="subtitle">
        당신의 인생 영화를 선택하거나 순위를 확인하세요!
      </p>

      {/* 라운드 선택 */}
      <div className="round-box">
        <span className="round-label">🏆 진행할 라운드:</span>
        <select
          value={round}
          onChange={(e) => setRound(Number(e.target.value))}
          className="round-select"
        >
          <option value={8}>8강</option>
          <option value={16}>16강</option>
          <option value={32}>32강</option>
          <option value={64}>64강</option>
        </select>
      </div>

      {/* 장르 카드 */}
      <div className="genre-grid">
        {genreData.map((g) => {
          const bgImage = g.topMovie
            ? `url(${g.topMovie.img})`
            : "linear-gradient(135deg, #333 0%, #111 100%)";

          return (
            <div className="genre-card" key={g.id}>
              <div
                className="card-bg"
                style={{
                  backgroundImage: bgImage,
                  filter: g.topMovie ? "brightness(0.4)" : "none",
                }}
              />

              <div className="card-content">
                <h2 className="genre-name">{g.name}</h2>

                {g.topMovie && (
                  <div className="top-movie-badge">
                    🥇 1위: {g.topMovie.name}
                  </div>
                )}

                <div className="btn-group">
                  <button
                    className="btn-start"
                    onClick={() => handleStartGame(g.id)}
                  >
                    ▶ 시작
                  </button>

                  <button
                    className="btn-rank"
                    onClick={() => handleViewRank(g.id)}
                  >
                    🏆 순위
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
