# python/formatters/translation_formatter.py
import re
from datetime import datetime
import logging

def format_translation_result(korean_original, basic_translation, optimized_translation, 
                            final_prompt, negative_prompt, style):
    """번역 결과 포맷팅"""
    try:
        # 번역 품질 검증
        quality_metrics = validate_translation_quality(final_prompt, korean_original)
        
        result = {
            "korean_original": korean_original,
            "basic_translation": clean_translation_text(basic_translation),
            "optimized_translation": clean_translation_text(optimized_translation),
            "final_prompt": clean_final_prompt(final_prompt),
            "negative_prompt": negative_prompt,
            "style": style,
            "quality_metrics": quality_metrics,
            "translation_timestamp": datetime.now().isoformat(),
            "processing_status": "success"
        }
        
        logging.info(f"번역 포맷팅 완료: {len(final_prompt)} 문자")
        return result
        
    except Exception as e:
        logging.error(f"번역 포맷팅 실패: {e}")
        return create_fallback_translation(korean_original, style, str(e))

def clean_translation_text(text):
    """번역 텍스트 정리"""
    if not text:
        return ""
    
    # 불필요한 문구 제거
    unwanted_phrases = [
        "영어 번역:", "English translation:", "영어 프롬프트:", "English prompt:",
        "번역 결과:", "Translation result:", "다음과 같습니다:", "as follows:",
        "결과:", "Result:", "프롬프트:", "Prompt:", "\n", "\r", "\t"
    ]
    
    cleaned = text.strip()
    for phrase in unwanted_phrases:
        cleaned = cleaned.replace(phrase, "")
    
    # 연속된 공백 정리
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r',\s*,', ',', cleaned)  # 연속된 쉼표 제거
    
    return cleaned.strip()

def clean_final_prompt(prompt):
    """최종 프롬프트 정리"""
    if not prompt:
        return ""
    
    # 기본 정리
    cleaned = clean_translation_text(prompt)
    
    # 중복 키워드 제거
    keywords = [kw.strip() for kw in cleaned.split(',')]
    unique_keywords = []
    
    for keyword in keywords:
        if keyword and keyword.lower() not in [uk.lower() for uk in unique_keywords]:
            unique_keywords.append(keyword)
    
    # 키워드 순서 최적화 (중요한 것부터)
    priority_keywords = []
    normal_keywords = []
    
    high_priority = ['children', 'book', 'illustration', 'cute', 'colorful']
    
    for keyword in unique_keywords:
        if any(hp in keyword.lower() for hp in high_priority):
            priority_keywords.append(keyword)
        else:
            normal_keywords.append(keyword)
    
    return ', '.join(priority_keywords + normal_keywords)

def validate_translation_quality(final_prompt, korean_original):
    """번역 품질 검증"""
    issues = []
    quality_score = 100
    
    # 기본 검증
    if not final_prompt.strip():
        issues.append("빈 번역 결과")
        quality_score -= 50
    
    # 길이 검증
    if len(final_prompt) < 20:
        issues.append("번역 결과가 너무 짧음")
        quality_score -= 25
    elif len(final_prompt) > 500:
        issues.append("번역 결과가 너무 길음")
        quality_score -= 15
    
    # 한국어 포함 여부 확인
    korean_chars = re.findall(r'[가-힣]', final_prompt)
    if len(korean_chars) > 0:
        issues.append(f"한국어가 {len(korean_chars)}개 포함됨")
        quality_score -= 20
    
    # 이미지 생성 적합성 확인
    image_keywords = ['illustration', 'character', 'scene', 'color', 'style', 'book', 'children']
    keyword_count = sum(1 for kw in image_keywords if kw in final_prompt.lower())
    
    if keyword_count < 2:
        issues.append("이미지 생성에 적합하지 않은 프롬프트")
        quality_score -= 30
    
    # 품질 등급 결정
    if quality_score >= 90:
        grade = "A"
    elif quality_score >= 75:
        grade = "B"
    elif quality_score >= 60:
        grade = "C"
    else:
        grade = "D"
    
    return {
        "issues": issues,
        "quality_score": max(0, quality_score),
        "quality_grade": grade,
        "keyword_count": len(final_prompt.split(',')),
        "character_count": len(final_prompt),
        "has_korean": len(korean_chars) > 0,
        "image_keyword_count": keyword_count
    }

def create_fallback_translation(korean_original, style, error_msg):
    """폴백 번역 생성"""
    style_keywords = {
        "classic": "traditional fairy tale illustration, classic children's book style",
        "adventure": "adventure illustration, dynamic scene, exciting",
        "educational": "educational illustration, learning scene, friendly",
        "fantasy": "fantasy illustration, magical, whimsical",
        "modern": "modern illustration, contemporary, clean"
    }
    
    base_prompt = "children's book illustration, cute characters, colorful, high quality, detailed"
    style_specific = style_keywords.get(style, style_keywords["classic"])
    
    fallback_prompt = f"{base_prompt}, {style_specific}"
    
    return {
        "korean_original": korean_original,
        "final_prompt": fallback_prompt,
        "negative_prompt": "ugly, blurry, low quality, nsfw, violence, scary",
        "style": style,
        "error": error_msg,
        "processing_status": "fallback",
        "quality_metrics": {
            "quality_score": 60,
            "quality_grade": "C",
            "fallback": True
        }
    }