#!/usr/bin/env python3
# python/path_resolver.py
import sys
import os
from pathlib import Path


def resolve_models_root():
    """USB 우선, 개발환경 폴백으로 모델 루트 디렉토리 찾기"""

    # 현재 실행 파일 위치에서 시작
    if getattr(sys, 'frozen', False):
        # PyInstaller로 패키징된 경우
        current_path = Path(sys.executable).parent
    else:
        # 개발 환경
        current_path = Path(__file__).parent

    # 상위 디렉토리들을 차례로 확인
    for parent in [current_path] + list(current_path.parents):
        models_dir = parent / "models"
        if models_dir.exists() and models_dir.is_dir():
            # models 폴더 내에 image-models나 text-models가 있는지 확인
            if any((models_dir / subdir).exists() for subdir in ["image-models", "text-models"]):
                print(f"Models root found: {models_dir}", file=sys.stderr)
                return models_dir

    print("Models root not found - using None", file=sys.stderr)
    return None


if __name__ == "__main__":
    # 테스트용
    root = resolve_models_root()
    print(f"Models root: {root}")
