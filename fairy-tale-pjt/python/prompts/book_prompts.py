# python/prompts/book_prompts.py
BOOK_PROMPTS = {
    "classic": """다음 줄거리를 바탕으로 정확히 6페이지의 동화책을 만들어주세요.

줄거리 정보:
- 제목: {title}
- 주인공: {character}
- 줄거리: {plot}
- 교훈: {lesson}

요구사항:
- 정확히 6페이지 구성
- 각 페이지는 2-3문장 (50-100자)
- 페이지별로 자연스러운 스토리 진행
- 마지막 페이지는 해피엔딩과 교훈

다음 JSON 형식으로 정확히 응답:
{{
    "pages": [
        {{"page": 1, "content": "첫 번째 페이지 내용"}},
        {{"page": 2, "content": "두 번째 페이지 내용"}},
        {{"page": 3, "content": "세 번째 페이지 내용"}},
        {{"page": 4, "content": "네 번째 페이지 내용"}},
        {{"page": 5, "content": "다섯 번째 페이지 내용"}},
        {{"page": 6, "content": "여섯 번째 페이지 내용"}}
    ],
    "title": "{title}",
    "style": "classic"
}}

JSON만 응답하고 다른 내용은 포함하지 마세요.""",

    "adventure": """모험 동화책 6페이지를 만들어주세요.

제목: {title}
주인공: {character}  
줄거리: {plot}

요구사항:
- 역동적이고 흥미진진한 내용
- 각 페이지마다 모험의 단계별 진행
- 도전과 성장 과정 포함

JSON 형식으로 응답:
{{
    "pages": [
        {{"page": 1, "content": "모험의 시작"}},
        {{"page": 2, "content": "첫 번째 도전"}},
        {{"page": 3, "content": "어려움과 시련"}},
        {{"page": 4, "content": "동료들과의 협력"}},
        {{"page": 5, "content": "위기 극복"}},
        {{"page": 6, "content": "성공과 성장"}}
    ],
    "title": "{title}",
    "style": "adventure"
}}""",

    "educational": """교육 동화책을 만들어주세요.

제목: {title}
내용: {plot}

요구사항:
- 학습 내용을 자연스럽게 포함
- 단계별로 지식 전달
- 재미있고 이해하기 쉬운 설명

JSON 형식 응답:
{{
    "pages": [
        {{"page": 1, "content": "학습 주제 소개"}},
        {{"page": 2, "content": "기본 개념 설명"}},
        {{"page": 3, "content": "구체적 예시"}},
        {{"page": 4, "content": "실험이나 관찰"}},
        {{"page": 5, "content": "결과와 발견"}},
        {{"page": 6, "content": "정리와 응용"}}
    ],
    "title": "{title}",
    "style": "educational"
}}"""
}

def get_book_prompt(story_data, style="classic"):
    """동화책 생성 프롬프트"""
    if style not in BOOK_PROMPTS:
        style = "classic"
    
    return BOOK_PROMPTS[style].format(
        title=story_data.get('title', ''),
        character=story_data.get('character', ''),
        plot=story_data.get('plot', ''),
        lesson=story_data.get('lesson', '')
    )