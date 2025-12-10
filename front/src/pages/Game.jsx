import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";
import Match from "../components/Match";
import Result from "../components/Result";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();

  const { round = 16, genre = "ALL" } = location.state || {};

  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextRound, setNextRound] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [winner, setWinner] = useState(null);

  // 1. 후보 불러오기
  useEffect(() => {
    console.log("📥 게임 설정 수신:", { round, genre });

    if (!round) return;

    setLoading(true);
    setErrorMsg("");
    setWinner(null);

    // 🌟 [수정 포인트 1] 주소를 '/game/candidates' 가 아니라 '/movies' 로 변경!
    api
      .get(`/movies`, {
        // 👈 여기!
        params: {
          round: round,
          genre: genre === "ALL" ? undefined : genre,
        },
      })
      .then((res) => {
        const raw = res.data || [];
        const list = raw.map((m) => ({
          ...m,
          name: m.name || m.title || "제목 없음",
        }));

        if (list.length === 0) {
          setErrorMsg("조건에 맞는 영화가 부족합니다.");
        } else {
          setMovies(list);
          setCurrentIndex(0);
          setNextRound([]);
          setMatchCount(0);
        }
      })
      .catch((err) => {
        console.error("API 에러:", err);
        setErrorMsg("서버와 연결할 수 없습니다.");
      })
      .finally(() => setLoading(false));
  }, [genre, round]);

  // 2. 영화 선택
  const handleSelect = async (winnerMovie) => {
    const left = movies[currentIndex];
    const right = movies[currentIndex + 1];
    if (!left || !right) return;

    const winnerId = winnerMovie.id;
    const loserId = left.id === winnerId ? right.id : left.id;

    // 🌟 [수정 포인트 2] 주소를 '/game/result' 가 아니라 '/movies/result' 로 변경!
    try {
      await api.post(`/movies/result`, { winnerId, loserId }); // 👈 여기!
    } catch (e) {
      console.error("결과 저장 실패:", e);
    }

    setMatchCount((prev) => prev + 1);
    const updatedNextRound = [...nextRound, winnerMovie];
    setNextRound(updatedNextRound);

    const nextIndex = currentIndex + 2;
    const isRoundFinished = nextIndex >= movies.length;

    if (isRoundFinished) {
      if (updatedNextRound.length === 1) {
        const final = updatedNextRound[0];
        setWinner(final);
        return;
      }
      setMovies(updatedNextRound);
      setCurrentIndex(0);
      setNextRound([]);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // 3. 렌더링 (그대로 유지)
  if (winner) {
    return <Result movie={winner} onRestart={() => navigate("/")} />;
  }

  if (loading) return <Loading />;
  if (errorMsg)
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: 50 }}>
        {errorMsg}
      </div>
    );
  if (movies.length === 0) return null;

  const left = movies[currentIndex];
  const right = movies[currentIndex + 1];

  if (!left || !right)
    return <div style={{ color: "white" }}>매칭 데이터 오류</div>;

  const currentRoundSize = movies.length;
  const currentRoundLabel =
    currentRoundSize === 2 ? "결승" : `${currentRoundSize}강`;
  const totalMatchesThisRound = currentRoundSize / 2;
  const currentMatchInRound = Math.floor(currentIndex / 2) + 1;

  return (
    <div className="tournament-container">
      {/* 🌟 선택된 라운드를 보여줌 (선택된 강수) */}
      <h1 style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
        {round}강전 시작! {/* round 변수 사용 */}
      </h1>
      <h2
        className="round-label"
        style={{ color: "#ddd", textAlign: "center" }}
      >
        {currentRoundLabel} ({currentMatchInRound}/{totalMatchesThisRound})
      </h2>
      <Match left={left} right={right} onSelect={handleSelect} />
    </div>
  );
}
