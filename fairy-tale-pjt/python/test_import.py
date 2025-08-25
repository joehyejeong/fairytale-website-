#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모듈 import 테스트 스크립트
"""

import sys
from pathlib import Path

# 현재 파일의 절대 경로를 기준으로 상위 디렉토리 추가
current_dir = Path(__file__).parent
python_root = current_dir.parent
sys.path.insert(0, str(python_root))

print(f"Python 경로: {sys.path}")
print(f"현재 디렉토리: {current_dir}")
print(f"Python 루트: {python_root}")

try:
    print("\n=== 모듈 import 테스트 ===")
    
    # 1. TextModel import 테스트
    print("1. TextModel import 시도...")
    from models.text_model import TextModel
    print("   ✓ TextModel import 성공")
    
    # 2. expansion_prompts import 테스트
    print("2. expansion_prompts import 시도...")
    from prompts.expansion_prompts import get_expansion_prompt
    print("   ✓ expansion_prompts import 성공")
    
    # 3. story_formatter import 테스트
    print("3. story_formatter import 시도...")
    from formatters.story_formatter import format_expanded_story
    print("   ✓ story_formatter import 성공")
    
    print("\n=== 모든 모듈 import 성공! ===")
    
    # 4. 실제 함수 테스트
    print("\n=== 함수 동작 테스트 ===")
    
    # 프롬프트 생성 테스트
    prompt = get_expansion_prompt("우주 탐험", "classic")
    print(f"프롬프트 생성: {len(prompt)} 문자")
    
    # TextModel 인스턴스 생성 테스트
    try:
        model = TextModel("gemma3:4b")
        print("TextModel 인스턴스 생성 성공")
    except Exception as e:
        print(f"TextModel 인스턴스 생성 실패: {e}")
    
    print("\n=== 테스트 완료 ===")
    
except ImportError as e:
    print(f"\n❌ Import 오류: {e}")
    print(f"현재 Python 경로: {sys.path}")
    
except Exception as e:
    print(f"\n❌ 기타 오류: {e}")

if __name__ == "__main__":
    pass
