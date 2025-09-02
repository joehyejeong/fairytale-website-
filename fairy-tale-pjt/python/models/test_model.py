# find_current_models.py - 현재 모델 위치 찾기
import os
import sys
from pathlib import Path


def find_project_models():
    """현재 프로젝트의 모델들 위치 찾기"""
    print("🔍 현재 프로젝트 모델 위치 찾기")
    print("=" * 50)

    # 현재 스크립트 기준으로 프로젝트 루트 찾기
    current_file = Path(__file__).resolve()
    project_root = current_file.parent

    # 상위 디렉토리들을 확인해서 package.json이나 main.py가 있는 곳 찾기
    for parent in [project_root] + list(project_root.parents):
        if any((parent / file).exists() for file in ['package.json', 'main.py', 'electron']):
            project_root = parent
            break

    print(f"📁 프로젝트 루트: {project_root}")

    # 1. models_cache 폴더 (Image Model 용)
    models_cache = project_root / "models_cache"
    print(f"\n🖼️ 이미지 모델 캐시 체크: {models_cache}")

    if models_cache.exists():
        print("✅ models_cache 폴더 발견!")
        check_huggingface_cache(models_cache)
    else:
        print("❌ models_cache 폴더 없음")

        # HuggingFace 기본 캐시도 확인
        default_hf_cache = Path.home() / ".cache" / "huggingface"
        if default_hf_cache.exists():
            print(f"✅ 기본 HF 캐시 발견: {default_hf_cache}")
            check_huggingface_cache(default_hf_cache)

    # 2. Ollama 모델들
    print(f"\n💬 텍스트 모델 (Ollama) 체크")
    ollama_locations = [
        Path.home() / ".ollama" / "models",
        Path("C:/Users") / os.getenv('USERNAME', '') /
        ".ollama" / "models" if os.name == 'nt' else None
    ]

    for location in ollama_locations:
        if location and location.exists():
            print(f"✅ Ollama 모델 발견: {location}")
            check_ollama_models(location)
            break
    else:
        print("❌ Ollama 모델 폴더를 찾을 수 없습니다")

    # 3. 프로젝트 내 다른 모델 폴더들
    print(f"\n📁 프로젝트 내 기타 모델 폴더 체크")
    other_model_dirs = [
        project_root / "models",
        project_root / "weights",
        project_root / "checkpoints",
        project_root / "python" / "models",
    ]

    for model_dir in other_model_dirs:
        if model_dir.exists():
            print(f"✅ 추가 모델 폴더: {model_dir}")
            list_files(model_dir)


def check_huggingface_cache(cache_dir):
    """HuggingFace 캐시 내용 확인"""
    try:
        # hub 폴더 확인 (models--로 시작하는 폴더들)
        hub_dir = cache_dir / "hub"
        if hub_dir.exists():
            model_dirs = [d for d in hub_dir.iterdir(
            ) if d.is_dir() and d.name.startswith("models--")]
            print(f"   HuggingFace 모델 개수: {len(model_dirs)}")

            for model_dir in model_dirs[:5]:  # 처음 5개만 표시
                size_mb = get_folder_size_mb(model_dir)
                print(f"   📦 {model_dir.name} ({size_mb:.1f}MB)")

            if len(model_dirs) > 5:
                print(f"   ... 및 {len(model_dirs) - 5}개 추가 모델")

        # 전체 캐시 크기
        total_size_gb = get_folder_size_mb(cache_dir) / 1024
        print(f"   💾 총 캐시 크기: {total_size_gb:.2f}GB")

    except Exception as e:
        print(f"   ❌ 캐시 확인 오류: {e}")


def check_ollama_models(models_dir):
    """Ollama 모델 확인"""
    try:
        # blobs와 manifests 폴더 확인
        blobs_dir = models_dir / "blobs"
        manifests_dir = models_dir / "manifests"

        if blobs_dir.exists():
            blob_files = list(blobs_dir.glob("*"))
            total_size_gb = sum(
                f.stat().st_size for f in blob_files if f.is_file()) / (1024**3)
            print(f"   📦 Ollama blobs: {len(blob_files)}개 파일")
            print(f"   💾 총 크기: {total_size_gb:.2f}GB")

        if manifests_dir.exists():
            manifest_dirs = [d for d in manifests_dir.iterdir() if d.is_dir()]
            print(f"   📋 모델 매니페스트: {len(manifest_dirs)}개")
            for manifest in manifest_dirs[:3]:
                print(f"     - {manifest.name}")

    except Exception as e:
        print(f"   ❌ Ollama 모델 확인 오류: {e}")


def list_files(directory, max_files=10):
    """폴더 내 파일 목록"""
    try:
        files = list(directory.glob("*"))
        print(f"   📄 파일 개수: {len(files)}")

        model_files = [f for f in files if f.suffix.lower(
        ) in ['.bin', '.pt', '.pth', '.onnx', '.safetensors']]
        if model_files:
            print("   🤖 모델 파일들:")
            for file in model_files[:max_files]:
                size_mb = file.stat().st_size / (1024**2)
                print(f"     - {file.name} ({size_mb:.1f}MB)")

        folders = [f for f in files if f.is_dir()]
        if folders:
            print(f"   📁 하위 폴더: {', '.join(f.name for f in folders[:5])}")

    except Exception as e:
        print(f"   ❌ 파일 목록 오류: {e}")


def get_folder_size_mb(folder):
    """폴더 크기 MB 단위로 계산"""
    try:
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(folder):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                if os.path.exists(filepath):
                    total_size += os.path.getsize(filepath)
        return total_size / (1024 * 1024)
    except:
        return 0


def generate_copy_commands():
    """USB 복사 명령어 생성"""
    print("\n" + "=" * 50)
    print("📋 USB 복사 명령어 (Windows 기준)")
    print("=" * 50)

    project_root = Path.cwd()
    models_cache = project_root / "models_cache"
    ollama_models = Path.home() / ".ollama" / "models"

    print("REM USB 드라이브를 E:로 가정")
    print("mkdir E:\\models")
    print("mkdir E:\\models\\image-models")
    print("mkdir E:\\models\\text-models")
    print()

    if models_cache.exists():
        print(f'REM HuggingFace 모델 복사')
        print(
            f'xcopy /E /I "{models_cache}" E:\\models\\image-models\\cache\\')
        print()

    if ollama_models.exists():
        print(f'REM Ollama 모델 복사')
        print(
            f'xcopy /E /I "{ollama_models}" E:\\models\\text-models\\ollama\\')
        print()

    print("REM 복사 후 USB에서 테스트")
    print("E:\\YourApp-Test\\run-test.bat")


if __name__ == "__main__":
    find_project_models()
    generate_copy_commands()
    input("\n엔터를 눌러 종료...")
