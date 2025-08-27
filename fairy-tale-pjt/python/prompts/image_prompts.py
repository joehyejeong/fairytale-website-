#!/usr/bin/env python3
# python/prompts/image_prompts.py

def get_image_generation_prompt(description, style="watercolor illustration"):
    """이미지 생성용 프롬프트 생성"""

    style_modifiers = {
        "watercolor illustration": "watercolor painting, soft colors, artistic illustration, children's book style",
        "casual drawing": "casual sketch, hand-drawn style, simple lines, friendly artwork",
        "colored pencil style": "colored pencil art, textured drawing, artistic sketch, vibrant colors",
        "3D animation": "3D rendered, Pixar style, animated movie quality, smooth surfaces",
        "vintage fairy tale": "vintage storybook illustration, classic fairy tale art, nostalgic style"
    }

    # 스타일별 수식어 가져오기
    style_desc = style_modifiers.get(style, style)

    # 기본 품질 수식어
    quality_modifiers = "high quality, detailed, beautiful, professional artwork"

    # 부정 프롬프트 (생성하지 말아야 할 요소들)
    negative_elements = "blurry, low quality, distorted, ugly, nsfw, inappropriate"

    prompt = f"{description}, {style_desc}, {quality_modifiers}"

    return {
        "positive_prompt": prompt,
        "negative_prompt": negative_elements,
        "style": style,
        "original_description": description
    }


def enhance_description_for_children_book(description, page_context=""):
    """동화책용 이미지 설명 향상"""

    # 동화책 스타일 수식어 추가
    book_style = "children's book illustration, family-friendly, colorful, whimsical"

    # 페이지 컨텍스트가 있으면 추가
    if page_context:
        enhanced = f"{description}, {page_context}, {book_style}"
    else:
        enhanced = f"{description}, {book_style}"

    return enhanced


def get_stable_diffusion_params():
    """Stable Diffusion 기본 파라미터"""
    return {
        "num_inference_steps": 20,  # 추론 스텝 수 (속도와 품질의 균형)
        "guidance_scale": 7.5,      # CFG 스케일 (프롬프트 따름 정도)
        "width": 512,               # 이미지 너비
        "height": 512,              # 이미지 높이
        "negative_prompt": "blurry, low quality, distorted, ugly, nsfw, inappropriate content"
    }


def create_image_filename(page_number, style="default"):
    """이미지 파일명 생성"""
    return f"{str(page_number).zfill(2)}.png"


def get_safety_prompt_filter(description):
    """안전한 콘텐츠인지 확인하는 필터"""

    # 부적절한 키워드 리스트
    inappropriate_keywords = [
        "violent", "scary", "frightening", "horror",
        "weapon", "blood", "death", "nsfw"
    ]

    description_lower = description.lower()

    for keyword in inappropriate_keywords:
        if keyword in description_lower:
            return False, f"부적절한 내용이 감지되었습니다: {keyword}"

    return True, "안전한 콘텐츠입니다"
