import sys
import json
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer

sys.stdout.reconfigure(encoding='utf-8')

# 1. Node.js로부터 영화 ID 받기
if len(sys.argv) < 2:
    print(json.dumps([]))
    sys.exit()

target_movie_id = int(sys.argv[1])

# 2. 데이터 로드 (DB 대신 json 파일 사용해서 속도 최적화)
# 현재 파일(utils/recommend_movie.py) 기준으로 movie_data.json 위치 찾기
current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, '..', 'data', 'movie_data.json')

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        movies_data = json.load(f)
    
    # Pandas DataFrame으로 변환
    df = pd.DataFrame(movies_data)

    # 3. 데이터 전처리 (genreIds가 리스트 형태인지 확인)
    # 예: [28, 12, 16] -> [1, 0, 1, ...] (원-핫 인코딩)
    mlb = MultiLabelBinarizer()
    genre_matrix = mlb.fit_transform(df['genreIds'])

    # 4. 코사인 유사도 계산
    # 전체 매트릭스를 다 구하면 느리니까, 타겟 영화와 전체 영화 간의 유사도만 계산
    
    # 타겟 영화의 인덱스 찾기
    target_idx = df.index[df['id'] == target_movie_id].tolist()
    
    if not target_idx:
        print(json.dumps([])) # 해당 ID가 없으면 빈 배열
        sys.exit()
        
    target_index = target_idx[0]
    
    # 유사도 계산 (타겟 영화 1개 vs 전체 영화 N개)
    # shape: (1, N)
    sim_scores = cosine_similarity([genre_matrix[target_index]], genre_matrix)
    
    # 5. 유사도 순으로 정렬
    # flatten()으로 1차원 배열로 만들고, 인덱스와 함께 저장
    sim_scores = list(enumerate(sim_scores[0]))
    
    # 점수 높은 순 정렬 (내림차순)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # 6. 상위 5개 추출 (0번은 자기 자신이므로 제외하고 1~6번 슬라이싱)
    top_indices = [i[0] for i in sim_scores[1:6]]
    
    # 결과 반환 (필요한 컬럼만)
    recommendations = df.iloc[top_indices][['id', 'name', 'img', 'genreIds']].to_dict('records')
    
    # 7. JSON으로 출력 (Node.js가 이걸 받음)
    print(json.dumps(recommendations, ensure_ascii=False))

except Exception as e:
    # 에러 발생 시 로그 출력 (Node.js stderr로 감)
    sys.stderr.write(str(e))
    print(json.dumps([]))