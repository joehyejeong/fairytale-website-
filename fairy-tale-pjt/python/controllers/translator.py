# python/controllers/translator.py
import sys
import json
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from models.text_model import TextModel
from prompts.translation_prompts import get_translation_prompt, get_style_keywords
from formatters.translation_formatter import format_translation_result

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Translator:
    def __init__(self, model_name="gemma2"):
        """번역 컨트롤러"""
        try:
            self.text_model = TextModel(model_name)
            logging.info(f"Translator 초기화 완료: {model_name}")
        except Exception as e:
            logging.error(f"Translator 초기화 실패: {e}")
            raise
    
    def translate_for_image_generation(self, korean_description, style="classic"):
        """이미지 생성용 한국어 → 영어 번역"""
        try:
            logging.info(f"번역 시작: '{korean_description[:30]}...' ({style})")
            
            # 1. 기본 번역
            basic_prompt = get_translation_prompt(
                "image_description",
                korean_text=korean_description,
                style=style
            )
            
            basic_translation = self.text_model.generate(
                prompt=basic_prompt,
                max_tokens=500,
                temperature=0.3  # 번역은 낮은 온도로
            )
            
            # 2. 스타일 최적화
            optimization_prompt = get_translation_prompt(
                "style_optimization",
                english_prompt=basic_translation,
                style=style
            )
            
            optimized_translation = self.text_model.generate(
                prompt=optimization_prompt,
                max_tokens=300,
                temperature=0.3
            )
            
            # 3. 스타일 키워드 추가
            style_keywords = get_style_keywords(style)
            
            # 4. 최종 프롬프트 조합
            final_prompt = self._combine_translation_elements(
                basic_translation,
                optimized_translation, 
                style_keywords
            )
            
            # 5. 부정적 프롬프트 생성
            negative_prompt = self._generate_negative_prompt(style)
            
            # 6. 결과 포맷팅
            result = format_translation_result(
                korean_original=korean_description,
                basic_translation=basic_translation,
                optimized_translation=optimized_translation,
                final_prompt=final_prompt,
                negative_prompt=negative_prompt,
                style=style
            )
            
            logging.info("번역 완료")
            return result
            
        except Exception as e:
            logging.error(f"번역 실패: {e}")
            # 폴백 번역
            return self._create_fallback_translation(korean_description, style, str(e))
    
    def _combine_translation_elements(self, basic, optimized, style_keywords):
        """번역 요소들 조합"""
        try:
            # 기본 번역 정리
            clean_basic = self._clean_translation(basic)
            clean_optimized = self._clean_translation(optimized)
            
            # 최종 프롬프트 구성
            elements = [clean_basic, style_keywords, clean_optimized]
            combined = ", ".join(filter(None, elements))
            
            # 중복 제거 및 정리
            return self._deduplicate_keywords(combined)
            
        except Exception as e:
            logging.warning(f"번역 조합 실패, 기본 번역 사용: {e}")
            return self._clean_translation(basic)
    
    def _clean_translation(self, text):
        """번역 텍스트 정리"""
        if not text:
            return ""
        
        # 불필요한 문구 제거
        unwanted = [
            "영어 번역:", "English:", "번역:", "Translation:",
            "프롬프트:", "Prompt:", "다음과 같습니다", "결과:",
            "\n", "\r"
        ]
        
        cleaned = text.strip()
        for phrase in unwanted:
            cleaned = cleaned.replace(phrase, "")
        
        return cleaned.strip()
    
    def _deduplicate_keywords(self, text):
        """키워드 중복 제거"""
        try:
            keywords = [kw.strip() for kw in text.split(',')]
            unique_keywords = []
            
            for keyword in keywords:
                if keyword and keyword.lower() not in [uk.lower() for uk in unique_keywords]:
                    unique_keywords.append(keyword)
            
            return ', '.join(unique_keywords)
        except:
            return text
    
    def _generate_negative_prompt(self, style):
        """부정적 프롬프트 생성"""
        base_negative = "ugly, blurry, bad anatomy, deformed, low quality, nsfw, violence, scary, dark, horror"
        
        style_negative = {
            "classic": ", modern, technology, contemporary",
            "adventure": ", boring, static, dull",
            "educational": ", confusing, messy, chaotic",
            "fantasy": ", realistic, mundane",
            "modern": ", old-fashioned, vintage"
        }
        
        return base_negative + style_negative.get(style, "")
    
    def _create_fallback_translation(self, korean_text, style, error_msg):
        """폴백 번역 생성"""
        # 간단한 키워드 기반 번역
        basic_keywords = "children's book illustration, cute, colorful, friendly"
        style_keywords = get_style_keywords(style)
        
        fallback_prompt = f"{basic_keywords}, {style_keywords}"
        
        return {
            "korean_original": korean_text,
            "final_prompt": fallback_prompt,
            "negative_prompt": self._generate_negative_prompt(style),
            "style": style,
            "error": error_msg,
            "fallback": True
        }

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("사용법: python translator.py <korean_text> [style]")
        
        korean_text = sys.argv[1]
        style = sys.argv[2] if len(sys.argv) > 2 else "classic"
        
        translator = Translator()
        result = translator.translate_for_image_generation(korean_text, style)
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        error_response = {
            "error": str(e),
            "korean_original": sys.argv[1] if len(sys.argv) > 1 else "",
            "final_prompt": "children's book illustration, cute, colorful",
            "negative_prompt": "ugly, blurry, low quality",
            "style": sys.argv[2] if len(sys.argv) > 2 else "classic"
        }
        print(json.dumps(error_response, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()