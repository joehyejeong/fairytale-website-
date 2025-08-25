#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
테스트용 스토리 익스팬더
"""

import sys
import json
import os
from pathlib import Path

# 상위 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent))

def test_story_expander():
    """테스트 실행"""
    try:
        from controllers.story_expander import StoryExpander
        
        print("StoryExpander 테스트 시작...")
        
        # StoryExpander 인스턴스 생성
        expander = StoryExpander()
        print("✓ StoryExpander 초기화 성공")
        
        # 테스트 아이디어로 줄거리 생성
        test_idea = "작은 다람쥐가 거대한 용을 물리치는 이야기"
        test_style = "classic"
        
        print(f"테스트 아이디어: {test_idea}")
        print(f"테스트 스타일: {test_style}")
        
        # 줄거리 확장 실행
        result = expander.expand_story(test_idea, test_style)
        
        print("✓ 줄거리 생성 완료")
        print(f"결과 타입: {type(result)}")
        print(f"결과 길이: {len(result) if isinstance(result, list) else 'N/A'}")
        
        # 결과 출력
        print("\n=== 생성된 줄거리 ===")
        if isinstance(result, list):
            for i, plot in enumerate(result, 1):
                print(f"\n--- 줄거리 {i} ---")
                print(f"제목: {plot.get('title', 'N/A')}")
                print(f"주인공: {plot.get('character', 'N/A')}")
                print(f"줄거리: {plot.get('plot', 'N/A')[:100]}...")
                print(f"교훈: {plot.get('lesson', 'N/A')}")
        else:
            print(f"제목: {result.get('title', 'N/A')}")
            print(f"주인공: {result.get('character', 'N/A')}")
            print(f"줄거리: {result.get('plot', 'N/A')[:100]}...")
            print(f"교훈: {result.get('lesson', 'N/A')}")
        
        # JSON 형식으로 출력 (Electron에서 사용)
        print("\n=== JSON 출력 ===")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        return True
        
    except Exception as e:
        print(f"❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_direct_call():
    """직접 실행 테스트"""
    try:
        from controllers.story_expander import StoryExpander
        
        expander = StoryExpander()
        result = expander.expand_story("테스트 아이디어", "classic")
        
        # JSON 출력 (Electron에서 파싱할 수 있도록)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return True
        
    except Exception as e:
        # 에러 시에도 JSON 형식으로 출력
        error_response = [
            {
                "error": str(e),
                "title": "테스트 실패",
                "character": "테스트 캐릭터",
                "plot": f"테스트 중 오류가 발생했습니다: {str(e)}",
                "lesson": "테스트의 중요성을 배울 수 있습니다.",
                "style": "classic",
                "processing_status": "test_error"
            }
        ]
        print(json.dumps(error_response, ensure_ascii=False, indent=2))
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # 테스트 모드
        success = test_story_expander()
        sys.exit(0 if success else 1)
    else:
        # 직접 실행 모드 (Electron에서 호출)
        test_direct_call()
