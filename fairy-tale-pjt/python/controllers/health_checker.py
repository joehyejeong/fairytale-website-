#!/usr/bin/env python3
import sys
import json
from pathlib import Path

# Python 경로 설정
current_dir = Path(__file__).parent
python_dir = current_dir.parent
sys.path.insert(0, str(python_dir))


def main():
    try:
        print("빠른 AI 연결 상태 체크 시작", file=sys.stderr)

        # 텍스트 모델 - 라이브러리만 체크
        text_available = False
        try:
            import ollama
            # Ollama 서버 연결만 체크 (모델 로드 안함)
            client = ollama.Client(host='localhost:11434')
            models = client.list()
            text_available = True
            text_message = "Ollama 서버 연결 정상"
            print("텍스트 모델: Ollama 서버 연결 확인", file=sys.stderr)
        except Exception as e:
            text_message = f"Ollama 연결 실패: {str(e)}"
            print(f"텍스트 모델 오류: {e}", file=sys.stderr)

        # 이미지 모델 - 라이브러리만 체크
        image_available = False
        try:
            from diffusers import StableDiffusionPipeline
            import torch
            # 단순히 라이브러리 존재와 torch 사용 가능 여부만 체크
            device = "cuda" if torch.cuda.is_available() else "cpu"
            image_available = True
            image_message = f"이미지 생성 라이브러리 정상 ({device})"
            print(f"이미지 모델: 라이브러리 확인 완료 ({device})", file=sys.stderr)
        except Exception as e:
            image_message = f"이미지 라이브러리 오류: {str(e)}"
            print(f"이미지 모델 오류: {e}", file=sys.stderr)

        # 결과 출력
        result = {
            "success": True,
            "text_available": text_available,
            "image_available": image_available,
            "messages": {
                "text": text_message,
                "image": image_message
            }
        }

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        error_result = {
            "success": False,
            "error": f"health check 오류: {str(e)}",
            "text_available": False,
            "image_available": False
        }
        print(json.dumps(error_result, ensure_ascii=False))


if __name__ == "__main__":
    main()
