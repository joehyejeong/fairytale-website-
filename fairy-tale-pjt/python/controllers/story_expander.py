#!/usr/bin/env python3
# python/controllers/story_expander.py - HuggingFace 모델 기반
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
            result = [{
                "title": "오류",
                "character": "시스템",
                "background": "에러 발생",
                "plot": "사용법: python story_expander.py <아이디어> [스타일]",
                "lesson": "올바른 사용법을 확인해주세요",
                "processing_status": "argument_error"
            }]
            print(json.dumps(result, ensure_ascii=False))
            return

        idea = sys.argv[1]
        style = sys.argv[2] if len(sys.argv) > 2 else "classic"
        
        print(f"스토리 생성 시작: {idea} (스타일: {style})", file=sys.stderr)
        
        # 1. 모델 import 및 로드 시도
        try:
            from models.text_model import TextModel
            print("TextModel 모듈 import 성공", file=sys.stderr)
            
            model = TextModel()
            model_available = model.available
            
            if model_available:
                print("HuggingFace 모델 로드 성공", file=sys.stderr)
            else:
                print("HuggingFace 모델 로드 실패, 폴백 모드로 진행", file=sys.stderr)
                
        except Exception as e:
            print(f"모델 로드 실패: {e}", file=sys.stderr)
            model_available = False
        
        # 2. 프롬프트 생성
        try:
            from prompts.expansion_prompts import get_expansion_prompt
            prompt = get_expansion_prompt(idea, style)
            print("프롬프트 생성 완료", file=sys.stderr)
        except Exception as e:
            print(f"프롬프트 생성 실패, 기본 프롬프트 사용: {e}", file=sys.stderr)
            prompt = create_simple_prompt(idea, style)
        
        # 3. AI 실행 또는 폴백
        if model_available:
            try:
                print("AI 모델 실행 중... (시간이 오래 걸릴 수 있습니다)", file=sys.stderr)
                raw_response = model.generate(prompt, max_tokens=1500, temperature=0.7)
                print(f"AI 응답 받음: {len(raw_response)} 문자", file=sys.stderr)
                
                # 간단한 파싱 시도
                story = parse_ai_response(raw_response, idea, style)
                
            except Exception as e:
                print(f"AI 실행 실패: {e}", file=sys.stderr)
                story = create_fallback_story(idea, style, str(e))
        else:
            story = create_fallback_story(idea, style, "모델을 사용할 수 없음")
        
        # 4. 결과 출력 (배열로)
        result = [story] if not isinstance(story, list) else story
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # 최종 에러 처리
        print(f"시스템 에러: {e}", file=sys.stderr)
        error_result = [{
            "title": "시스템 오류",
            "character": "에러 핸들러",
            "background": "예외 상황",
            "plot": f"예상치 못한 오류가 발생했습니다: {str(e)}",
            "lesson": "문제를 해결하기 위해 노력합시다",
            "processing_status": "system_error",
            "error": str(e)
        }]
        print(json.dumps(error_result, ensure_ascii=False))

def create_simple_prompt(idea, style):
    """간단한 기본 프롬프트"""
    return f"""다음 아이디어로 어린이를 위한 동화를 만들어주세요: "{idea}"

스타일: {style}

다음 JSON 형식으로만 답해주세요:
{{
    "title": "동화 제목",
    "character": "등장인물들",
    "background": "배경 설정", 
    "plot": "상세한 줄거리 (기승전결 포함)",
    "lesson": "교훈"
}}

JSON 형식을 정확히 지켜주세요."""

def parse_ai_response(raw_response, idea, style):
    """AI 응답 파싱 - HuggingFace 모델용"""
    try:
        print(f"응답 파싱 시작: {raw_response[:100]}...", file=sys.stderr)
        
        # JSON 블록 찾기
        if '{' in raw_response and '}' in raw_response:
            start = raw_response.find('{')
            end = raw_response.rfind('}') + 1
            json_str = raw_response[start:end]
            
            # JSON 파싱 시도
            parsed = json.loads(json_str)
            
            # 필수 필드 확인 및 보완
            story = {
                "title": parsed.get("title", f"{idea}의 이야기"),
                "character": parsed.get("character", "주인공"),
                "background": parsed.get("background", "신비로운 세계"),
                "plot": parsed.get("plot", f"{idea}를 바탕으로 한 이야기"),
                "lesson": parsed.get("lesson", "좋은 교훈"),
                "style": style,
                "processing_status": "ai_success"
            }
            
            print("JSON 파싱 성공", file=sys.stderr)
            return story
            
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 실패: {e}", file=sys.stderr)
    except Exception as e:
        print(f"응답 파싱 오류: {e}", file=sys.stderr)
    
    # 파싱 실패 시 원본 내용 활용
    print("원본 응답을 그대로 사용", file=sys.stderr)
    return {
        "title": f"{idea}",
        "character": "AI 작가",
        "background": "창작의 공간",
        "plot": raw_response[:500] + ("..." if len(raw_response) > 500 else ""),
        "lesson": "AI와 함께 만든 이야기",
        "style": style,
        "processing_status": "raw_content"
    }

def create_fallback_story(idea, style, error_msg=""):
    """폴백 스토리 생성"""
    print("폴백 스토리 생성", file=sys.stderr)
    
    return {
        "title": f"{idea}의 모험",
        "character": "용감한 주인공과 친구들",
        "background": "아름다운 마을과 신비로운 숲",
        "plot": f"{idea}를 주제로 한 흥미진진한 모험이 시작됩니다. 주인공은 친구들과 함께 여러 어려움을 극복하며, 마지막에는 소중한 것을 깨닫게 됩니다.",
        "lesson": "용기와 우정의 소중함을 배울 수 있습니다",
        "style": style,
        "processing_status": "fallback",
        "error": error_msg if error_msg else None
    }

if __name__ == "__main__":
    main()