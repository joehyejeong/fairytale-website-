# python/prompts/translation_prompts.py
TRANSLATION_PROMPTS = {
    "image_description": """다음 한국어 동화 장면을 영어 이미지 생성 프롬프트로 번역해주세요.

한국어 원문: "{korean_text}"
동화 스타일: {style}

요구사항:
1. 아이들 동화책 일러스트에 적합한 영어 표현
2. 시각적 요소를 명확하게 표현
3. 부드럽고 따뜻한 느낌의 단어 선택
4. 불필요한 설명 제거, 핵심만 번역

영어 이미지 프롬프트:""",

    "style_optimization": """동화책 이미지 생성을 위해 다음 영어 프롬프트를 최적화해주세요.

원본 프롬프트: "{english_prompt}"
스타일: {style}

최적화 요구사항:
- children's book illustration 스타일 강조
- 부드럽고 따뜻한 색감 (soft colors, warm lighting)
- 아이들 친화적 (child-friendly, cute, adorable)
- 높은 품질 키워드 추가 (high quality, detailed, professional)

최적화된 프롬프트:""",

    "negative_prompt": """동화책에 적합하지 않은 요소들을 제거하기 위한 부정적 프롬프트를 생성해주세요.

스타일: {style}

부정적 프롬프트:"""
}

STYLE_KEYWORDS = {
    "classic": "traditional fairy tale illustration, storybook art, classic children's book style",
    "adventure": "adventure illustration, dynamic scene, action-packed, heroic",
    "educational": "educational illustration, learning scene, friendly and approachable",
    "fantasy": "fantasy illustration, magical elements, whimsical, enchanted",
    "modern": "modern illustration, contemporary style, clean and simple"
}

def get_translation_prompt(prompt_type, korean_text="", style="classic", english_prompt=""):
    """번역 프롬프트 생성"""
    if prompt_type not in TRANSLATION_PROMPTS:
        raise ValueError(f"Unknown prompt type: {prompt_type}")
    
    if prompt_type == "image_description":
        return TRANSLATION_PROMPTS[prompt_type].format(
            korean_text=korean_text,
            style=style
        )
    elif prompt_type == "style_optimization":
        return TRANSLATION_PROMPTS[prompt_type].format(
            english_prompt=english_prompt,
            style=style
        )
    elif prompt_type == "negative_prompt":
        return TRANSLATION_PROMPTS[prompt_type].format(style=style)

def get_style_keywords(style):
    """스타일별 키워드 반환"""
    return STYLE_KEYWORDS.get(style, STYLE_KEYWORDS["classic"])