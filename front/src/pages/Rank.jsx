import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";
import "../styles/Rank.css";

export default function Rank() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialSort = queryParams.get("sort") || "winRate";
  const initialGenre = queryParams.get("genre") || "ALL";

  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(initialSort);
  const [genre, setGenre] = useState(initialGenre);

  const genreNames = {
    ALL: "전체 통합",
    28: "액션",
    10749: "로맨스",
    35: "코미디",
    27: "공포",
    878: "SF/판타지",
    16: "애니메이션",
    18: "드라마",
    80: "범죄",
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sortParam = params.get("sort");
    const genreParam = params.get("genre");

    if (sortParam) setSortBy(sortParam);
    if (genreParam) setGenre(genreParam);
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/ranks", {
          params: { page, genre, sort: sortBy },
        });
        setRanks(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("랭킹 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, [page, genre, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const getRankIcon = (index) => {
    const realRank = (page - 1) * 20 + index + 1;
    if (realRank === 1) return "🥇";
    if (realRank === 2) return "🥈";
    if (realRank === 3) return "🥉";
    return `${realRank}위`;
  };

  return (
    <div className="rank-container">
      <Link to="/" className="back-btn">
        ◀ 메인으로 돌아가기
      </Link>

      <h1 className="rank-title">
        {genreNames[genre] || "전체"} 명예의 전당 🔥
      </h1>
      <p className="rank-desc">
        {genre === "ALL"
          ? "모든 영화의 통합 순위입니다."
          : `${genreNames[genre]} 장르 내에서의 순위입니다.`}
      </p>

      <div className="sort-tabs">
        <button
          onClick={() => setSortBy("winRate")}
          className={`sort-tab ${sortBy === "winRate" ? "active" : ""}`}
        >
          🏆 유저 픽 (승률순)
        </button>
        <button
          onClick={() => setSortBy("popularity")}
          className={`sort-tab ${sortBy === "popularity" ? "active" : ""}`}
        >
          🌍 글로벌 트렌드 (인기순)
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="rank-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th className="align-left">영화 제목</th>
                  <th>{sortBy === "winRate" ? "승률" : "인기도"}</th>
                  <th>{sortBy === "winRate" ? "전적" : "개봉일"}</th>
                </tr>
              </thead>
              <tbody>
                {ranks.length > 0 ? (
                  ranks.map((movie, index) => (
                    <tr key={movie.id}>
                      <td className="rank-number">{getRankIcon(index)}</td>
                      <td className="movie-cell">
                        <img
                          src={movie.img}
                          alt={movie.name}
                          className="movie-img"
                        />
                        <span>{movie.name}</span>
                      </td>
                      <td
                        className={
                          sortBy === "winRate"
                            ? "winrate-text"
                            : "popularity-text"
                        }
                      >
                        {sortBy === "winRate"
                          ? `${parseFloat(movie.winRate).toFixed(1)}%`
                          : Math.round(movie.popularity)}
                      </td>
                      <td className="sub-text">
                        {sortBy === "winRate"
                          ? `${movie.winCount}승 / ${movie.matchCount}전`
                          : movie.release_date?.substring(0, 4) || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="page-btn"
            >
              ◀ 이전
            </button>
            <span className="page-number">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="page-btn"
            >
              다음 ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
