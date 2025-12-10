const { Sequelize } = require("sequelize");
const { spawn } = require("child_process");
const path = require("path");
const Movie = require("../models/Movie");
const Op = Sequelize.Op; // 🌟 이거 꼭 있어야 함!

// 1. 게임 후보 뽑기
exports.getCandidates = async (req, res) => {
  console.log("--------------------------------");
  console.log("🔍 요청 들어옴:", req.query);
  const genre = req.query.genre;
  const round = parseInt(req.query.round);

  const allowedRounds = [4, 8, 16, 32, 64, 128, 256, 512, 1024];
  const limitCount = allowedRounds.includes(round) ? round : 32;
  let whereCondition = {};

  if (genre && genre !== "ALL") {
    // MySQL JSON 필드 검색 함수
    whereCondition = Sequelize.literal(`JSON_CONTAINS(genreIds, '${genre}')`);
  }

  try {
    const candidates = await Movie.findAll({
      where: whereCondition,
      order: Sequelize.literal("RAND()"),
      limit: limitCount,
    });
    if (candidates.length < limitCount) {
      console.log(
        `⚠️ 영화가 부족합니다. (요청: ${limitCount}, 실제: ${candidates.length})`
      );
    }
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "후보 추천 실패" });
  }
};

// 2. 게임 결과 저장
exports.saveResult = async (req, res) => {
  const { winnerId, loserId } = req.body;
  try {
    await Movie.increment(
      { winCount: 1, matchCount: 1 },
      { where: { id: winnerId } }
    );
    await Movie.increment({ matchCount: 1 }, { where: { id: loserId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "결과 저장 실패" });
  }
};

// 3. 랭킹 조회
exports.getRanks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const sort = req.query.sort || "winRate";
    const genre = req.query.genre || "ALL";

    // 1. 필터 조건 만들기
    let whereCondition = {};
    if (genre !== "ALL") {
      whereCondition = Sequelize.literal(`JSON_CONTAINS(genreIds, '${genre}')`);
    }

    // 2. 정렬 조건 만들기
    let orderQuery;
    if (sort === "popularity") {
      orderQuery = [
        ["popularity", "DESC"],
        ["release_date", "DESC"],
      ];
    } else {
      orderQuery = [
        [
          Sequelize.literal(
            "CASE WHEN matchCount = 0 THEN 0 ELSE (winCount / matchCount) END"
          ),
          "DESC",
        ],
        ["winCount", "DESC"],
        ["name", "ASC"],
      ];
    }

    // 3. 조회
    const { count, rows } = await Movie.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      attributes: {
        include: [
          [
            Sequelize.literal(
              "ROUND(CASE WHEN matchCount = 0 THEN 0 ELSE (winCount / matchCount) * 100 END, 1)"
            ),
            "winRate",
          ],
        ],
      },
      order: orderQuery,
    });

    res.json({
      success: true,
      data: rows,
      totalMovies: count,
      totalPages: Math.ceil(count / limit),
      page,
      sort,
      genre,
    });
  } catch (error) {
    console.error("랭킹 조회 실패:", error);
    res.status(500).json({ error: "랭킹 조회 실패" });
  }
};

// 4. 추천 시스템 (파이썬 연결)
exports.getRecommendations = async (req, res) => {
  const { movieId } = req.query;

  if (!movieId) {
    return res.status(400).json({ error: "movieId 파라미터가 필요합니다." });
  }

  const pythonScriptPath = path.join(__dirname, "../utils/recommend_movie.py");
  const pythonProcess = spawn("python", [pythonScriptPath, movieId]);

  let resultData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`🐍 Python Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      return res.status(500).json({ error: "추천 시스템 오류" });
    }

    try {
      const recommendations = JSON.parse(resultData);
      console.log(
        `✨ 영화 ID ${movieId}에 대한 추천 ${recommendations.length}개 완료`
      );
      res.json(recommendations);
    } catch (err) {
      console.error("JSON 파싱 실패:", err);
      res.json([]);
    }
  });
};

// 🌟 [추가됨] 5. 메인 화면용 장르별 1위 조회 (이게 없어서 에러 났던 것!)
exports.getGenreTops = async (req, res) => {
  try {
    const targets = [
      { id: "ALL", name: "전체" },
      { id: 28, name: "액션" },
      { id: 10749, name: "로맨스" },
      { id: 35, name: "코미디" },
      { id: 27, name: "공포" },
      { id: 878, name: "SF/판타지" },
      { id: 16, name: "애니" },
      { id: 18, name: "드라마" },
      { id: 80, name: "범죄" },
    ];

    const results = await Promise.all(
      targets.map(async (genre) => {
        let whereCondition = {};
        if (genre.id !== "ALL") {
          // JSON_CONTAINS 사용 (안전하게)
          whereCondition = Sequelize.literal(
            `JSON_CONTAINS(genreIds, '${genre.id}')`
          );
        }

        const topMovie = await Movie.findOne({
          where: whereCondition,
          attributes: [
            "id",
            "name",
            "img",
            [
              Sequelize.literal(
                "CASE WHEN matchCount = 0 THEN 0 ELSE (winCount / matchCount) * 100 END"
              ),
              "winRate",
            ],
          ],
          order: [
            [Sequelize.literal("winRate"), "DESC"],
            ["winCount", "DESC"],
          ],
        });

        return {
          id: genre.id,
          name: genre.name,
          topMovie: topMovie || null,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("장르별 1위 조회 실패:", err);
    res.status(500).json({ error: "데이터 조회 실패" });
  }
};
