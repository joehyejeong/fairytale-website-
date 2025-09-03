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

        # 텍스트 모델 체크
        text_available = False
        text_message = "Ollama 연결 실패"
        try:
            import ollama
            client = ollama.Client(host='localhost:11434')
            models = client.list()
            text_available = True
            text_message = "Ollama 연결 성공"
        except Exception as e:
            text_message = f"Ollama 오류: {str(e)}"

        # 이미지 모델 체크
        image_available = False
        image_message = "이미지 모델 로드 실패"
        try:
            from models.image_model import ImageModel
            img_model = ImageModel()
            image_available = img_model.available
            image_message = "이미지 모델 로드 성공" if image_available else "이미지 모델 초기화 실패"
        except Exception as e:
            image_message = f"이미지 모델 오류: {str(e)}"

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
            "image_available": False,
            "messages": {
                "text": "체크 실패",
                "image": "체크 실패"
            }
        }
        print(json.dumps(error_result, ensure_ascii=False))


if __name__ == "__main__":
    main()
