# python/prompts/book_prompts.py - 동화책 생성용 프롬프트

def get_book_generation_prompt(plot_data, style="classic"):
    """줄거리 데이터를 바탕으로 6페이지 동화책 생성 프롬프트"""
    
    title = plot_data.get("title", "동화")
    character = plot_data.get("character", "주인공")
    background = plot_data.get("background", "신비로운 세계")
    plot = plot_data.get("plot", "이야기")
    lesson = plot_data.get("lesson", "좋은 교훈")
    
    prompt = f"""당신은 한국의 동화 작가입니다. 다음 정보를 바탕으로 6페이지 분량의 어린이 동화책을 만들어주세요.

**동화 정보:**
- 제목: {title}
- 등장인물: {character}
- 배경: {background}
- 줄거리: {plot}
- 교훈: {lesson}
- 스타일: {style}

**요구사항:**
1. 6-10세 어린이가 읽기 쉬운 문체 사용
2. 각 페이지는 150-200자 내외로 작성
3. 반드시 6페이지로 구성해야 합니다
4. 기승전결 구조를 6페이지에 걸쳐 자연스럽게 전개
5. 페이지별 구성:
   - 1페이지: 도입부 (등장인물과 상황 소개)
   - 2페이지: 전개 시작 (문제나 모험의 시작)
   - 3페이지: 전개 심화 (갈등이나 어려움)
   - 4페이지: 절정 (가장 중요한 사건)
   - 5페이지: 해결 (문제 해결 과정)
   - 6페이지: 결말 (교훈과 마무리)

**중요:** 반드시 6페이지를 모두 작성해주세요. 2페이지나 4페이지로 끝내지 마세요.

다음 JSON 형식으로만 답해주세요:

{{
    "title": "동화책 제목",
    "pages": [
        {{"page": 1, "content": "첫 번째 페이지 내용 (150-200자)"}},
        {{"page": 2, "content": "두 번째 페이지 내용 (150-200자)"}},
        {{"page": 3, "content": "세 번째 페이지 내용 (150-200자)"}},
        {{"page": 4, "content": "네 번째 페이지 내용 (150-200자)"}},
        {{"page": 5, "content": "다섯 번째 페이지 내용 (150-200자)"}},
        {{"page": 6, "content": "여섯 번째 페이지 내용 (150-200자)"}}
    ]
}}

다른 설명 없이 JSON만 출력해주세요."""

    return prompt