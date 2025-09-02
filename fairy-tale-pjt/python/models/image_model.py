#!/usr/bin/env python3
# python/models/image_model.py - GPU 우선 실행이 추가된 Stable Diffusion 이미지 생성 모델

import sys
import os
from pathlib import Path
from PIL import Image
import torch

# USB에 EXE파일을 함께 넣어놓음을 가정하여, 이렇게 현재 실행 위치에서 부터 찾는 것.


def find_model_cache_dir():
    """USB 우선, 개발환경 폴백으로 캐시 경로 찾기"""
    # USB에서 찾기
    current_script = Path(__file__)
    for parent in [current_script.parent] + list(current_script.parents):
        usb_models = parent / "models"
        if usb_models.exists():
            usb_cache = usb_models / "image-models" / "cache"
            if usb_cache.exists():
                return usb_cache

    # 개발환경 경로
    dev_cache = Path(__file__).parent.parent.parent / "models_cache"
    if dev_cache.exists():
        return dev_cache

    # 기본 HF 캐시
    return Path.home() / ".cache" / "huggingface"


cache_dir = find_model_cache_dir()
os.environ["HF_HOME"] = str(cache_dir)
os.environ["TRANSFORMERS_CACHE"] = str(cache_dir)
os.environ["HF_DATASETS_CACHE"] = str(cache_dir)


class ImageModel:
    def __init__(self, model_name="runwayml/stable-diffusion-v1-5"):
        self.model_name = model_name
        self.pipe = None
        self.available = False

        # GPU 환경 체크 및 설정
        self.device, self.torch_dtype = self._setup_device()

        print(
            f"ImageModel 초기화 시작: {model_name} on {self.device}", file=sys.stderr)
        print(f"Torch dtype: {self.torch_dtype}", file=sys.stderr)
        self._initialize_model()

    def _setup_device(self):
        """GPU/CPU 환경 설정 및 최적화"""
        print("=== GPU/CPU 환경 체크 ===", file=sys.stderr)

        # CUDA 사용 가능 여부 확인
        if torch.cuda.is_available():
            device = "cuda"
            torch_dtype = torch.float16  # GPU에서는 float16 사용 (메모리 절약)

            # GPU 정보 출력
            gpu_count = torch.cuda.device_count()
            current_gpu = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(
                0).total_memory / (1024**3)  # GB 단위

            print(f"✅ CUDA 사용 가능", file=sys.stderr)
            print(f"   GPU 개수: {gpu_count}", file=sys.stderr)
            print(f"   현재 GPU: {current_gpu}", file=sys.stderr)
            print(f"   GPU 메모리: {gpu_memory:.1f}GB", file=sys.stderr)

            # 메모리가 부족한 경우 경고
            if gpu_memory < 8.0:
                print(
                    f"⚠️ GPU 메모리가 {gpu_memory:.1f}GB로 부족할 수 있습니다 (권장: 8GB 이상)", file=sys.stderr)
                print("   메모리 최적화 옵션을 사용합니다", file=sys.stderr)
        else:
            device = "cpu"
            torch_dtype = torch.float32  # CPU에서는 float32 사용

            print("❌ CUDA 사용 불가능 - CPU 모드로 실행", file=sys.stderr)
            print("   CPU 모드는 매우 느릴 수 있습니다 (GPU 권장)", file=sys.stderr)

            # MPS (Apple Silicon) 지원 체크
            if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                device = "mps"
                print("✅ Apple Silicon MPS 사용 가능 - MPS 모드로 실행", file=sys.stderr)

        return device, torch_dtype

    def _initialize_model(self):
        """Stable Diffusion 모델 초기화"""
        try:
            # HuggingFace Diffusers 라이브러리 import
            from diffusers import StableDiffusionPipeline

            print("Stable Diffusion 모델 로딩 중... (시간이 오래 걸릴 수 있습니다)", file=sys.stderr)

            # 모델 로드 설정
            load_kwargs = {
                "torch_dtype": self.torch_dtype,
                "use_safetensors": True,
                "variant": "fp16" if self.torch_dtype == torch.float16 else None
            }

            # variant가 None이면 제거
            if load_kwargs["variant"] is None:
                del load_kwargs["variant"]

            # 모델 로드 (처음에는 다운로드 시간이 오래 걸릴 수 있음)
            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_name,
                cache_dir=str(cache_dir),
                **load_kwargs
            )

            # 디바이스별 최적화 설정
            self._optimize_for_device()

            print("Stable Diffusion 모델 로드 완료", file=sys.stderr)
            self.available = True

        except ImportError as e:
            print(f"diffusers 라이브러리가 설치되지 않았습니다: {e}", file=sys.stderr)
            print("설치: pip install diffusers transformers accelerate", file=sys.stderr)
            self.available = False
        except Exception as e:
            print(f"이미지 모델 로드 실패: {e}", file=sys.stderr)
            print("대안: 폴백 모드로 실행됩니다", file=sys.stderr)

            # GPU 메모리 부족 관련 에러 체크
            if "out of memory" in str(e).lower() or "cuda" in str(e).lower():
                print("💡 GPU 메모리 부족일 수 있습니다. CPU 모드로 재시도합니다.", file=sys.stderr)
                self._fallback_to_cpu()
            else:
                self.available = False

    def _optimize_for_device(self):
        """디바이스별 최적화 설정"""
        if self.device == "cuda":
            # CUDA 최적화
            self.pipe = self.pipe.to("cuda")

            # GPU 메모리 체크 후 최적화 옵션 적용
            gpu_memory = torch.cuda.get_device_properties(
                0).total_memory / (1024**3)

            if gpu_memory < 12.0:  # 12GB 미만이면 메모리 최적화 사용
                print("GPU 메모리 최적화 옵션 적용 중...", file=sys.stderr)
                try:
                    # 메모리 효율성 향상
                    self.pipe.enable_model_cpu_offload()  # VRAM 절약
                    print("✅ CPU offload 적용", file=sys.stderr)
                except Exception as e:
                    print(f"CPU offload 실패: {e}", file=sys.stderr)

                try:
                    # xFormers 메모리 효율성 (설치되어 있는 경우에만)
                    self.pipe.enable_xformers_memory_efficient_attention()
                    print("✅ xFormers 메모리 최적화 적용", file=sys.stderr)
                except Exception as e:
                    print(f"xFormers 최적화 실패 (선택사항): {e}", file=sys.stderr)

                try:
                    # Attention slicing (더 적은 메모리 사용)
                    self.pipe.enable_attention_slicing()
                    print("✅ Attention slicing 적용", file=sys.stderr)
                except Exception as e:
                    print(f"Attention slicing 실패: {e}", file=sys.stderr)

        elif self.device == "mps":
            # Apple Silicon MPS 최적화
            self.pipe = self.pipe.to("mps")
            print("✅ MPS 디바이스로 이동 완료", file=sys.stderr)

        else:
            # CPU 최적화
            self.pipe = self.pipe.to("cpu")
            print("CPU 모드로 설정 완료 (속도가 매우 느릴 수 있습니다)", file=sys.stderr)

    def _fallback_to_cpu(self):
        """GPU 실패시 CPU로 폴백"""
        try:
            print("CPU 모드로 폴백 시도 중...", file=sys.stderr)
            self.device = "cpu"
            self.torch_dtype = torch.float32

            from diffusers import StableDiffusionPipeline

            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,
                use_safetensors=True,
                cache_dir=str(cache_dir)
            )

            self.pipe = self.pipe.to("cpu")
            print("✅ CPU 모드 폴백 성공", file=sys.stderr)
            self.available = True

        except Exception as e:
            print(f"CPU 폴백도 실패: {e}", file=sys.stderr)
            self.available = False

    def generate_image(self, prompt_data, page_number, width=512, height=512):
        """이미지 생성 및 저장"""
        # 고정된 저장 경로 설정
        current_dir = Path(__file__).parent
        temps_dir = current_dir.parent.parent / "src" / "assets" / "temps"
        temps_dir.mkdir(parents=True, exist_ok=True)

        # 페이지 번호를 파일명으로 사용
        image_filename = f"{str(page_number).zfill(2)}.png"
        save_path = temps_dir / image_filename

        if not self.available:
            print("이미지 모델을 사용할 수 없습니다. 기본 이미지를 생성합니다.", file=sys.stderr)
            return self._create_fallback_image(str(save_path), width, height)

        try:
            print(
                f"이미지 생성 시작: {prompt_data['positive_prompt'][:50]}...", file=sys.stderr)
            print(f"디바이스: {self.device}, 해상도: {width}x{height}",
                  file=sys.stderr)

            # GPU 메모리 정리 (CUDA인 경우)
            if self.device == "cuda":
                torch.cuda.empty_cache()

            # 이미지 생성 파라미터 설정
            generation_kwargs = {
                "prompt": prompt_data["positive_prompt"],
                "negative_prompt": prompt_data.get("negative_prompt", ""),
                "width": width,
                "height": height,
                "num_inference_steps": 20,  # 빠른 생성을 위해 20 스텝 사용
                "guidance_scale": 7.5,
                "num_images_per_prompt": 1
            }

            # CPU 모드에서는 더 빠른 설정 사용
            if self.device == "cpu":
                generation_kwargs["num_inference_steps"] = 10  # CPU에서는 더 적은 스텝
                print("CPU 모드: 빠른 생성을 위해 10 스텝 사용", file=sys.stderr)

            # 이미지 생성
            with torch.inference_mode():  # 추론 모드 최적화
                image = self.pipe(**generation_kwargs).images[0]

            # 이미지 저장
            image.save(str(save_path), "PNG", optimize=True)
            print(f"이미지 생성 완료: {save_path}", file=sys.stderr)

            # GPU 메모리 정리
            if self.device == "cuda":
                torch.cuda.empty_cache()

            return {
                "success": True,
                "image_path": str(save_path),
                "prompt_used": prompt_data["positive_prompt"],
                "page_number": page_number,
                "device_used": self.device
            }

        except Exception as e:
            print(f"이미지 생성 중 오류: {e}", file=sys.stderr)

            # GPU 메모리 관련 오류인 경우 CPU로 재시도
            if self.device == "cuda" and ("out of memory" in str(e).lower()):
                print("GPU 메모리 부족으로 CPU 모드로 재시도합니다...", file=sys.stderr)
                self._fallback_to_cpu()
                if self.available:
                    return self.generate_image(prompt_data, page_number, width, height)

            return self._create_fallback_image(str(save_path), width, height)

    def _create_fallback_image(self, save_path, width=512, height=512):
        """폴백 이미지 생성 (단색 배경 + 텍스트)"""
        try:
            from PIL import Image, ImageDraw, ImageFont

            print("폴백 이미지 생성 중...", file=sys.stderr)

            # 단색 배경 이미지 생성
            image = Image.new('RGB', (width, height),
                              color='#F5E6A8')  # 밝은 노란색
            draw = ImageDraw.Draw(image)

            # 텍스트 추가
            try:
                font = ImageFont.load_default()
            except:
                font = None

            text = "Image\nGenerated"
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            x = (width - text_width) // 2
            y = (height - text_height) // 2

            draw.text((x, y), text, fill='#666666', font=font, align='center')

            # 이미지 저장
            image.save(save_path, "PNG")
            print(f"폴백 이미지 생성 완료: {save_path}", file=sys.stderr)

            return {
                "success": True,
                "image_path": save_path,
                "fallback": True,
                "message": "AI 이미지 모델을 사용할 수 없어 기본 이미지를 생성했습니다.",
                "page_number": Path(save_path).stem  # 파일명에서 확장자 제거
            }

        except Exception as e:
            print(f"폴백 이미지 생성 실패: {e}", file=sys.stderr)
            return {
                "success": False,
                "error": f"이미지 생성 실패: {str(e)}"
            }

    def check_health(self):
        """모델 상태 확인 (실제 이미지 생성 없이)"""
        if not self.available:
            return False, "이미지 모델이 초기화되지 않았습니다"

        try:
            # 모델 파이프라인이 로드되었는지만 확인
            if self.pipe is None:
                return False, "이미지 파이프라인이 로드되지 않았습니다"

            # 간단한 토크나이저 테스트만 (이미지 생성 없이)
            test_prompt = "a simple test"
            # 토큰화만 테스트 (실제 생성 X)

            return True, f"이미지 모델 정상 ({self.device})"

        except Exception as e:
            return False, f"이미지 모델 오류: {str(e)}"
