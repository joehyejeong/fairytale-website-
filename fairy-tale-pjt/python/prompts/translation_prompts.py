#!/usr/bin/env python3
# python/prompts/translation_prompts.py

def get_translation_prompt(korean_text, target_language="english"):
    """번역용 프롬프트 생성"""
    if target_language.lower() == "english":
        return f"""다음 한국어 텍스트를 영어로 번역해주세요. 
이미지 생성을 위한 프롬프트이므로 시각적 묘사에 집중하여 번역하세요.
불필요한 설명 없이 번역 결과만 제공해주세요.

번역할 텍스트: {korean_text}

번역 결과:"""

    return f"""Translate the following Korean text to {target_language}. 
Focus on visual descriptions as this is for image generation.
Provide only the translation result without additional explanations.

Text to translate: {korean_text}

Translation:"""


def get_image_description_prompt(korean_description):
    """이미지 설명을 영어로 번역하는 프롬프트"""
    return f"""다음 한국어 이미지 설명을 영어로 번역해주세요.
이미지 생성 AI가 이해하기 쉽도록 구체적이고 시각적인 표현으로 번역하세요.
번역 결과만 제공해주세요.

한국어 설명: {korean_description}

영어 번역:"""


def get_style_translation_prompt(korean_style):
    """스타일명을 영어로 번역하는 프롬프트"""
    style_mappings = {
        "수채화 일러스트": "watercolor illustration",
        "캐주얼 드로잉": "casual drawing",
        "색연필 스타일": "colored pencil style",
        "3D 애니메이션": "3D animation",
        "빈티지 동화": "vintage fairy tale"
    }

    if korean_style in style_mappings:
        return style_mappings[korean_style]

    return f"""다음 한국어 스타일명을 영어로 번역해주세요:
{korean_style}

영어 번역:"""
