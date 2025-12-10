import { useEffect, useState } from "react";

export default function useMovies(round = 16, genre = 0) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/game/candidates?round=${round}&genre=${genre}`
        );
        const data = await res.json();

        setMovies(data);
      } catch (err) {
        console.error("영화 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [round, genre]);

  return { movies, loading };
}
