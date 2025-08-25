# python/prompts/image_prompts.py
IMAGE_PROMPTS = {
    "classic": """Create a children's book illustration for page {page_number}:

Scene: {english_scene}

Style requirements:
- Traditional storybook illustration style
- Soft, warm colors (pastels preferred)
- Child-friendly and innocent appearance
- High quality, detailed artwork
- Professional children's book illustration
- Safe for all ages
- Cute and adorable characters
- {style_keywords}

Technical specs:
- 4:3 aspect ratio suitable for book pages
- Clear, clean composition
- Space for text overlay
- High resolution and detailed""",

    "adventure": """Create an adventure-themed children's book illustration for page {page_number}:

Scene: {english_scene}

Style requirements:  
- Dynamic and exciting adventure illustration
- Vibrant, energetic colors
- Action-packed but still child-appropriate
- Heroic and inspiring mood
- High quality adventure book style
- Detailed character expressions
- {style_keywords}

Composition:
- Clear focal point for the action
- Dynamic angles and perspective
- Space for text integration
- 4:3 book page ratio""",

    "educational": """Create an educational children's book illustration for page {page_number}:

Scene: {english_scene}

Style requirements:
- Educational illustration style
- Clear and informative visuals
- Friendly, approachable characters
- Bright, engaging colors
- Learning-focused composition
- High quality educational book art
- {style_keywords}

Educational focus:
- Clear visual information
- Easy to understand elements
- Encouraging and positive mood
- Suitable for learning context"""
}

def get_image_prompt(english_scene, page_number, style="classic"):
    """이미지 생성 프롬프트 구성"""
    if style not in IMAGE_PROMPTS:
        style = "classic"
    
    # 스타일별 키워드 가져오기
    from .translation_prompts import get_style_keywords
    style_keywords = get_style_keywords(style)
    
    return IMAGE_PROMPTS[style].format(
        page_number=page_number,
        english_scene=english_scene,
        style_keywords=style_keywords
    )

def get_negative_prompt(style="classic"):
    """부정적 프롬프트 반환"""
    base_negative = "ugly, blurry, bad anatomy, bad proportions, deformed, mutated, disfigured, low quality, pixelated, distorted, watermark, signature, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, nsfw, adult content, inappropriate, violence, scary, dark, horror, disturbing, gross, unpleasant"
    
    style_specific = {
        "classic": ", modern elements, technology, contemporary items",
        "adventure": ", boring, static, lifeless, dull",
        "educational": ", confusing, unclear, messy, chaotic",
        "fantasy": ", realistic, mundane, ordinary",
        "modern": ", old-fashioned, vintage, traditional elements"
    }
    
    return base_negative + style_specific.get(style, "")