#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI 모델 연결 상태 테스트 스크립트
실제 AI 요청을 보내지 않고 연결 상태만 확인
"""

import requests
import sys

def test_ollama_connection():
    """Ollama 서버 연결 상태 테스트"""
    try:
        # Ollama 서버 상태 확인 (간단한 ping)
        response = requests.get('http://localhost:11434/api/version', timeout=5)
        if response.status_code == 200:
            return True, "Ollama 서버 연결됨"
        else:
            return False, f"Ollama 서버 응답 오류: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Ollama 서버에 연결할 수 없습니다"
    except requests.exceptions.Timeout:
        return False, "Ollama 서버 응답 시간 초과"
    except Exception as e:
        return False, f"연결 테스트 오류: {str(e)}"

def test_text_model():
    """텍스트 모델 연결 상태 테스트"""
    try:
        print(f"텍스트 모델 테스트 시작...")
        # 간단한 모델 정보 요청 (실제 AI 처리는 하지 않음)
        response = requests.post('http://localhost:11434/api/show', 
                               json={"name": "gemma3:4b"}, 
                               timeout=5)
        print(f"텍스트 모델 응답 상태: {response.status_code}")
        
        # 단순히 연결만 되면 true 반환
        if response.status_code == 200:
            return True, "텍스트 모델 연결됨"
        else:
            return False, f"텍스트 모델 응답 오류: {response.status_code}"
    except Exception as e:
        print(f"텍스트 모델 테스트 예외: {str(e)}")
        return False, f"텍스트 모델 테스트 오류: {str(e)}"

def test_image_model():
    """이미지 모델 연결 상태 테스트 (현재는 기본값)"""
    # 이미지 모델이 구현되지 않았으므로 기본적으로 연결 안 됨으로 표시
    return False, "이미지 모델 연결 안 됨 (구현되지 않음)"

def main():
    """메인 함수"""
    print("🚀 AI 모델 연결 상태 테스트 시작...")
    
    # 각 모델별 연결 상태 테스트
    print("🔍 Ollama 서버 연결 테스트 중...")
    ollama_connected, ollama_msg = test_ollama_connection()
    print(f"📊 Ollama 결과: {ollama_connected} - {ollama_msg}")
    
    if ollama_connected:
        print("🔍 텍스트 모델 연결 테스트 중...")
        text_connected, text_msg = test_text_model()
        print(f"📊 텍스트 모델 결과: {text_connected} - {text_msg}")
    else:
        text_connected, text_msg = False, "Ollama 서버 연결 안 됨"
        print("❌ Ollama 연결 실패로 텍스트 모델 테스트 건너뜀")
    
    print("🔍 이미지 모델 연결 테스트 중...")
    image_connected, image_msg = test_image_model()
    print(f"📊 이미지 모델 결과: {image_connected} - {image_msg}")
    
    # 종료 코드만으로 결과 전달 (JSON 출력 없음)
    if ollama_connected and text_connected:
        print("✅ 테스트 성공 - 모든 모델 연결됨")
        sys.exit(0)  # 성공
    else:
        print("❌ 테스트 실패 - 일부 모델 연결 안 됨")
        sys.exit(1)  # 실패

if __name__ == "__main__":
    main()
