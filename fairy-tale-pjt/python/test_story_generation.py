#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
실제 동화 생성 테스트 스크립트
"""

import sys
import json
from pathlib import Path

# 현재 파일의 절대 경로를 기준으로 상위 디렉토리 추가
current_dir = Path(__file__).parent
python_root = current_dir.parent
sys.path.insert(0, str(python_root))

try:
    from controllers.story_expander import StoryExpander
    
    print("=== 동화 생성 테스트 시작 ===")
    
    # StoryExpander 인스턴스 생성
    expander = StoryExpander("gemma3:4b")
    print("✓ StoryExpander 생성 성공")
    
    # 간단한 아이디어로 동화 생성 테스트
    test_idea = "우주 탐험"
    test_style = "classic"
    
    print(f"\n테스트 아이디어: '{test_idea}' (스타일: {test_style})")
    print("동화 생성 중... (잠시 기다려주세요)")
    
    # 동화 생성 실행
    result = expander.expand_story(test_idea, test_style)
    
    print("\n=== 동화 생성 완료! ===")
    print(f"생성된 동화 수: {len(result)}")
    
    # 결과 출력
    for i, story in enumerate(result):
        print(f"\n--- 동화 {i+1} ---")
        print(f"제목: {story.get('title', 'N/A')}")
        print(f"등장인물: {story.get('character', 'N/A')}")
        print(f"배경: {story.get('background', 'N/A')}")
        print(f"줄거리: {story.get('plot', 'N/A')[:100]}...")
        print(f"교훈: {story.get('lesson', 'N/A')}")
        print(f"테마: {story.get('theme', 'N/A')}")
        print(f"처리 상태: {story.get('processing_status', 'N/A')}")
        print(f"품질 점수: {story.get('quality_score', 'N/A')}")
    
    # JSON 형태로도 출력
    print("\n=== JSON 형태 결과 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    print("\n=== 테스트 완료 ===")
    
except ImportError as e:
    print(f"❌ Import 오류: {e}")
    
except Exception as e:
    print(f"❌ 동화 생성 실패: {e}")
    import traceback
    traceback.print_exc()

if __name__ == "__main__":
    pass
