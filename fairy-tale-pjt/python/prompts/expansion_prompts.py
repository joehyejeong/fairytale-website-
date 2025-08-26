# python/prompts/expansion_prompts.py - 단순화 버전

def get_expansion_prompt(simple_idea, style="classic"):
    """줄거리 확장 프롬프트 생성"""
    
    base_prompt = f"""당신은 한국의 동화 작가입니다. 다음 아이디어를 바탕으로 어린이를 위한 동화를 만들어주세요.

아이디어: "{simple_idea}"
스타일: {style}

요구사항:
1. 6-10세 어린이가 이해할 수 있는 내용
2. 기승전결이 있는 완전한 이야기
3. 긍정적이고 교육적인 메시지
4. 200자 이상의 간단한한 줄거리. 

반드시 다음 JSON 형식으로만 답해주세요:
{{
    "title": "동화 제목 (10자 이내)",
    "character": "주인공과 주요 등장인물 소개", (예시: '민수', '빨간머리 앤')
    "background": "시간과 장소 배경", (예시1: '신비로운 마법의 숲'. 예시2: '햇빛중학교' )
    "plot": "기승전결을 포함한 간단한 줄거리 (200자 이상)", 
    "lesson": "이야기를 통해 전하고자 하는 교훈"(20자 이내)
}}

JSON 형식을 정확히 지켜주세요."""

    return base_prompt