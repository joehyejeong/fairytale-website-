# python/controllers/book_generator.py
import sys
import json
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from models.text_model import TextModel
from prompts.book_prompts import get_book_prompt
from formatters.book_formatter import format_book_pages

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class BookGenerator:
    def __init__(self, model_name="gemma2"):
        """동화책 생성 컨트롤러"""
        try:
            self.text_model = TextModel(model_name)
            logging.info(f"BookGenerator 초기화 완료: {model_name}")
        except Exception as e:
            logging.error(f"BookGenerator 초기화 실패: {e}")
            raise
    
    def generate_book(self, story_data, style="classic"):
        """6페이지 동화책 생성"""
        try:
            logging.info(f"동화책 생성 시작: '{story_data.get('title', 'Unknown')}' ({style})")
            
            # 1. 프롬프트 생성
            prompt = get_book_prompt(story_data, style)
            logging.info(f"동화책 프롬프트 길이: {len(prompt)} 문자")
            
            # 2. AI 모델 실행
            raw_response = self.text_model.generate(
                prompt=prompt,
                max_tokens=1500,
                temperature=0.6
            )
            logging.info(f"동화책 AI 응답: {len(raw_response)} 문자")
            
            # 3. 응답 포맷팅
            formatted_result = format_book_pages(raw_response, story_data, style)
            
            logging.info("동화책 생성 완료")
            return formatted_result
            
        except Exception as e:
            logging.error(f"동화책 생성 실패: {e}")
            # 폴백 동화책 생성
            return self._create_fallback_book(story_data, style, str(e))
    
    def _create_fallback_book(self, story_data, style, error_msg):
        """에러 시 기본 동화책 생성"""
        title = story_data.get('title', '기본 동화')
        plot = story_data.get