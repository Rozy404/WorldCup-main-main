// src/components/Result.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/Result.css";
import "../styles/match.css";

export default function Result({ movie, onRestart }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await api.get("/game/recommend", {
          params: { movieId: movie.id },
        });
        setRecommendations(res.data);
      } catch (err) {
        console.error("추천 영화 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [movie]);

  if (!movie) {
    return <div className="no-result">결과가 없습니다.</div>;
  }

  return (
    <div className="result-container">
      <h1 className="winner-title">🏆 최종 우승: {movie.name}</h1>

      <img className="winner-img" src={movie.img} alt={movie.name} />

      {movie.overview && <p className="movie-overview">{movie.overview}</p>}

      <hr className="divider" />

      <h2 className="recommend-title">🤖 '{movie.name}'을(를) 좋아하신다면?</h2>

      {loading ? (
        <p className="loading-text">AI가 영화를 분석 중입니다... 🧠</p>
      ) : (
        <div className="recommend-list">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div className="recommend-item" key={rec.id}>
                <img className="recommend-img" src={rec.img} alt={rec.title} />
                <p className="recommend-name">{rec.title}</p>
              </div>
            ))
          ) : (
            <p className="no-recommend">
              추천할 비슷한 영화를 찾지 못했습니다 😢
            </p>
          )}
        </div>
      )}

      <button className="restart-btn" onClick={onRestart}>
        다시하기
      </button>
    </div>
  );
}
