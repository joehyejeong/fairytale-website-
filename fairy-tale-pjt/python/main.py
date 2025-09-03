# python/main.py 수정
import sys
import os
from pathlib import Path

# 실행파일 경로 기준으로 Python 모듈 경로 설정
if getattr(sys, 'frozen', False):
    # PyInstaller로 패키징된 경우
    bundle_dir = Path(sys._MEIPASS)
else:
    # 개발 환경
    bundle_dir = Path(__file__).parent

sys.path.insert(0, str(bundle_dir))

# 이제 임포트 시도


def main():
    if len(sys.argv) < 2:
        print("Usage: main.py <controller> [args...]")
        sys.exit(1)

    controller = sys.argv[1]
    args = sys.argv[2:]

    try:
        if controller == "health_checker":
            from controllers.health_checker import main as health_main
            health_main()
        elif controller == "story_expander":
            from controllers.story_expander import main as story_main
            story_main(args)
        # ... 기타 컨트롤러들
        else:
            print(f"Unknown controller: {controller}")
            sys.exit(1)
    except ImportError as e:
        print(f"Import error: {e}")
        sys.exit(1)
