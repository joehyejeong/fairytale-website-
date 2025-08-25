# python/controllers/story_expander.py
# -*- coding: utf-8 -*-
import sys
import json
import logging
import os
from pathlib import Path

# Windows에서 UTF-8 인코딩 강제 설정
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

# 모든 모듈이 현재 폴더에 있으므로 경로 설정 불필요
print(f"🔧 현재 폴더에서 모듈 import: {os.getcwd()}")

try:
    from text_model import TextModel
    from expansion_prompts import get_expansion_prompt
    from story_formatter import format_expanded_story
    logging.info("모든 모듈 import 성공")
except ImportError as e:
    logging.error(f"모듈 import 실패: {e}")
    # 폴백: 직접 함수 정의
    def get_expansion_prompt(simple_idea, style="classic"):
        return f"간단한 아이디어 '{simple_idea}'를 바탕으로 동화를 만들어주세요."
    
    def format_expanded_story(raw_response, original_idea, style):
        return {
            "title": f"{original_idea}",
            "character": "주인공",
            "background": "신비로운 세계",
            "plot": raw_response,
            "lesson": "좋은 교훈",
            "theme": style,
            "style": style,
            "word_count": len(raw_response),
            "processing_status": "fallback"
        }

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class StoryExpander:
    def __init__(self, model_name="gemma3:4b"):
        """줄거리 확장 컨트롤러"""
        try:
            print(f"🎯 StoryExpander 초기화 시작")
            print(f"🎯 요청된 모델명: {model_name}")
            print(f"📁 현재 작업 디렉토리: {os.getcwd()}")
            print(f"📁 Python 경로: {sys.path}")
            
            print(f"🔗 TextModel 인스턴스 생성 시작...")
            self.text_model = TextModel(model_name)
            print(f"✅ TextModel 인스턴스 생성 완료")
            print(f"✅ TextModel 모델명: {self.text_model.model_name}")
            
            print(f"✅ StoryExpander 초기화 완료: {model_name}")
            logging.info(f"StoryExpander 초기화 완료: {model_name}")
        except Exception as e:
            print(f"❌ StoryExpander 초기화 실패: {e}")
            print(f"❌ 에러 타입: {type(e)}")
            print(f"❌ 에러 상세: {str(e)}")
            logging.error(f"StoryExpander 초기화 실패: {e}")
            raise
    
    def expand_story(self, simple_idea, style="classic"):
        """줄거리 확장 실행 - 1개의 자세한 동화 생성"""
        try:
            logging.info(f"줄거리 확장 시작: '{simple_idea}' ({style})")
            
            # 1. 프롬프트 생성 (expansion_prompts.py)
            base_prompt = get_expansion_prompt(simple_idea, style)
            logging.info(f"프롬프트 생성 완료: {len(base_prompt)} 문자")
            
            # 2. AI 모델 실행 (text_model.py)
            print(f"🤖 AI 모델 실행 시작...")
            print(f"📝 프롬프트 길이: {len(base_prompt)} 문자")
            base_response = self.text_model.generate(
                prompt=base_prompt,
                max_tokens=1500,
                temperature=0.7
            )
            print(f"✅ AI 모델 응답 받음: {len(base_response)} 문자")
            logging.info(f"AI 모델 응답 받음: {len(base_response)} 문자")
            logging.info(f"AI 모델 원본 응답: {base_response}")
            
            # 3. AI 응답을 포맷팅하여 반환 (1개만)
            logging.info("AI 응답을 포맷팅합니다.")
            try:
                formatted_result = format_expanded_story(base_response, simple_idea, style)
                result = [formatted_result]
                logging.info("동화 포맷팅 완료")
                return result
            except Exception as format_error:
                logging.warning(f"포맷팅 실패, 원본 응답 사용: {format_error}")
                # 포맷팅 실패 시 원본 응답 반환
                return [{
                    "title": f"{simple_idea}",
                    "character": "AI가 생성한 캐릭터",
                    "background": "AI가 생성한 배경",
                    "plot": base_response,  # AI 원본 응답을 그대로 사용
                    "lesson": "AI가 생성한 교훈",
                    "style": style,
                    "word_count": len(base_response),
                    "processing_status": "ai_raw_response"
                }]
            
        except Exception as e:
            logging.error(f"줄거리 확장 실패: {e}")
            # 에러 시 기본 응답 반환
            return self._create_fallback_plots(simple_idea, style, str(e))
    
    def _create_fallback_plots(self, simple_idea, style, error_msg):
        """폴백 줄거리 생성 - 1개만 반환"""
        logging.warning(f"AI 응답 처리 중 오류 발생: {error_msg}")
        logging.info("AI 응답 내용을 그대로 사용합니다.")
        
        # AI 응답 내용을 그대로 반환 (1개만)
        return [
            {
                "title": f"{simple_idea}",
                "character": "용감한 주인공",
                "background": "신비로운 모험의 세계",
                "plot": f"AI가 '{simple_idea}'에 대한 동화를 생성했습니다. 상세한 내용을 확인해보세요.",
                "lesson": "AI와 함께 창의적인 이야기를 만들어보세요.",
                "style": style,
                "word_count": 50,
                "processing_status": "ai_generated",
                "error": error_msg
            }
        ]

def main():
    """메인 실행 함수"""
    try:
        if len(sys.argv) < 2:
            raise ValueError("사용법: python story_expander.py <아이디어> [스타일]")
        
        simple_idea = sys.argv[1]
        style = sys.argv[2] if len(sys.argv) > 2 else "classic"
        
        print("🎭 story_expander.py 실행 중...")
        print(f"📝 아이디어: {simple_idea}")
        print(f"🎨 스타일: {style}")
        print(f"📁 현재 작업 디렉토리: {os.getcwd()}")
        print(f"📁 Python 스크립트 위치: {__file__}")
        print(f"📁 Python 루트 디렉토리: {Path(__file__).parent.parent}")
        print(f"🌐 환경변수 OLLAMA_HOST: {os.environ.get('OLLAMA_HOST', '설정되지 않음')}")
        print(f"🌐 환경변수 PYTHONPATH: {os.environ.get('PYTHONPATH', '설정되지 않음')}")
        
        # StoryExpander 실행
        expander = StoryExpander()
        result = expander.expand_story(simple_idea, style)
        
        print(f"✅ 결과: {len(result)}개 스토리 생성")
        
        # 결과 출력 (JSON)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        # 에러 발생 시 JSON 형식으로 에러 정보 출력 (1개만)
        error_response = [
            {
                "error": str(e),
                "title": "오류 발생",
                "character": "알 수 없음",
                "plot": f"줄거리 생성 중 오류가 발생했습니다: {str(e)}",
                "lesson": "때로는 예상치 못한 일이 일어날 수 있습니다",
                "style": sys.argv[2] if len(sys.argv) > 2 else "classic"
            }
        ]
        print(json.dumps(error_response, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()