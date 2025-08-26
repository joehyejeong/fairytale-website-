#!/usr/bin/env python3
# python/controllers/book_generator.py - Ollama 기반 동화책 생성
import sys
import json
import os
from pathlib import Path

# Python 경로 설정
current_dir = Path(__file__).parent
python_dir = current_dir.parent
sys.path.insert(0, str(python_dir))

def main():
    try:
        # 인자 확인
        if len(sys.argv) < 2:
            result = {
                "error": "사용법: python book_generator.py <줄거리_JSON> [스타일]",
                "pages": []
            }
            print(json.dumps(result, ensure_ascii=False))
            return

        plot_json = sys.argv[1]
        style = sys.argv[2] if len(sys.argv) > 2 else "classic"
        
        print(f"동화책 생성 시작 (스타일: {style})", file=sys.stderr)
        
        # 줄거리 데이터 파싱
        try:
            plot_data = json.loads(plot_json)
            print(f"줄거리 데이터 파싱 성공: {plot_data.get('title', 'Unknown')}", file=sys.stderr)
        except json.JSONDecodeError as e:
            print(f"줄거리 JSON 파싱 실패: {e}", file=sys.stderr)
            plot_data = {"title": "기본 제목", "plot": plot_json}
        
        # 1. 모델 import 및 로드 시도
        try:
            from models.text_model import TextModel
            print("TextModel 모듈 import 성공", file=sys.stderr)
            
            model = TextModel()
            model_available = model.available
            
            if model_available:
                print("Ollama 모델 로드 성공", file=sys.stderr)
            else:
                print("Ollama 모델 로드 실패, 폴백 모드로 진행", file=sys.stderr)
                
        except Exception as e:
            print(f"모델 로드 실패: {e}", file=sys.stderr)
            model_available = False
        
        # 2. 프롬프트 생성
        try:
            from prompts.book_prompts import get_book_generation_prompt
            prompt = get_book_generation_prompt(plot_data, style)
            print("동화책 프롬프트 생성 완료", file=sys.stderr)
        except Exception as e:
            print(f"프롬프트 생성 실패, 기본 프롬프트 사용: {e}", file=sys.stderr)
            prompt = create_simple_book_prompt(plot_data, style)
        
        # 3. AI 실행 또는 폴백
        if model_available:
            try:
                print("AI 모델로 동화책 생성 중...", file=sys.stderr)
                raw_response = model.generate(prompt, max_tokens=2000, temperature=0.7)
                print(f"AI 응답 받음: {len(raw_response)} 문자", file=sys.stderr)
                
                # AI 응답을 그대로 사용 (파싱하지 않음)
                book_data = {
                    "title": plot_data.get("title", "동화책"),
                    "raw_response": raw_response,
                    "processing_status": "ai_raw"
                }
                
            except Exception as e:
                print(f"AI 실행 실패: {e}", file=sys.stderr)
                book_data = create_fallback_book(plot_data, style, str(e))
        else:
            book_data = create_fallback_book(plot_data, style, "모델을 사용할 수 없음")
        
        # 4. 결과 출력
        print(json.dumps(book_data, ensure_ascii=False))
        
    except Exception as e:
        # 최종 에러 처리
        print(f"시스템 에러: {e}", file=sys.stderr)
        error_result = {
            "error": f"동화책 생성 중 오류: {str(e)}",
            "pages": [],
            "processing_status": "system_error"
        }
        print(json.dumps(error_result, ensure_ascii=False))

def create_simple_book_prompt(plot_data, style):
    """간단한 기본 동화책 생성 프롬프트"""
    title = plot_data.get("title", "동화")
    plot = plot_data.get("plot", "이야기")
    character = plot_data.get("character", "주인공")
    
    return f"""다음 줄거리를 바탕으로 6페이지 분량의 어린이 동화책을 만들어주세요:

제목: {title}
등장인물: {character}
줄거리: {plot}
스타일: {style}

각 페이지는 150-200자 정도로 작성하고, 다음 JSON 형식으로만 답해주세요:

{{
    "title": "동화책 제목",
    "pages": [
        {{"page": 1, "content": "첫 번째 페이지 내용"}},
        {{"page": 2, "content": "두 번째 페이지 내용"}},
        {{"page": 3, "content": "세 번째 페이지 내용"}},
        {{"page": 4, "content": "네 번째 페이지 내용"}},
        {{"page": 5, "content": "다섯 번째 페이지 내용"}},
        {{"page": 6, "content": "여섯 번째 페이지 내용"}}
    ]
}}

JSON 형식을 정확히 지켜주세요."""

# parse_book_response 함수 제거 - AI 응답을 그대로 사용

# create_pages_from_text 함수 제거 - AI 응답을 그대로 사용

def create_fallback_book(plot_data, style, error_msg=""):
    """폴백 동화책 생성"""
    print("폴백 동화책 생성", file=sys.stderr)
    
    title = plot_data.get("title", "모험의 이야기")
    plot = plot_data.get("plot", "흥미진진한 모험")
    
    # 기본 6페이지 구조
    pages = [
        {
            "page": 1,
            "content": f"옛날 옛적에 {title}의 주인공이 살고 있었습니다. 주인공은 매일 새로운 모험을 꿈꾸며 지냈습니다."
        },
        {
            "page": 2, 
            "content": f"어느 날, 주인공에게 특별한 일이 일어났습니다. {plot[:100]}..."
        },
        {
            "page": 3,
            "content": "주인공은 용기를 내어 모험을 시작했습니다. 길에서 만난 친구들과 함께 어려움을 극복해 나갔습니다."
        },
        {
            "page": 4,
            "content": "여행 중에 여러 도전이 기다리고 있었습니다. 하지만 주인공은 포기하지 않고 계속 앞으로 나아갔습니다."
        },
        {
            "page": 5,
            "content": "마침내 주인공은 목표를 달성했습니다. 그 과정에서 진정한 용기와 우정의 소중함을 배웠습니다."
        },
        {
            "page": 6,
            "content": "주인공은 집으로 돌아와 가족과 친구들에게 모험 이야기를 들려주었습니다. 그리고 모두 행복하게 살았답니다."
        }
    ]
    
    return {
        "title": title,
        "pages": pages,
        "processing_status": "fallback",
        "error": error_msg if error_msg else None
    }

if __name__ == "__main__":
    main()