# python/models/image_model.py
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import os
from PIL import Image
import base64
import io
import logging

class ImageModel:
    def __init__(self, model_name="runwayml/stable-diffusion-v1-5", device="auto"):
        """
        Stable Diffusion 모델 초기화
        
        Args:
            model_name: HuggingFace 모델 이름
            device: 사용할 디바이스 ("auto", "cuda", "cpu")
        """
        self.model_name = model_name
        self.device = self._setup_device(device)
        self.pipe = None
        self._load_model()
    
    def _setup_device(self, device):
        """디바이스 설정"""
        if device == "auto":
            if torch.cuda.is_available():
                device = "cuda"
                logging.info("CUDA GPU 사용")
            else:
                device = "cpu"
                logging.info("CPU 사용 (속도가 느릴 수 있습니다)")
        return device
    
    def _load_model(self):
        """모델 로드"""
        try:
            logging.info(f"Stable Diffusion 모델 로딩 중: {self.model_name}")
            
            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,  # NSFW 체크 비활성화 (동화책용)
                requires_safety_checker=False,
                use_auth_token=False,
                local_files_only=False
            )
            
            # 스케줄러 최적화
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipe.scheduler.config
            )
            
            self.pipe = self.pipe.to(self.device)
            
            # CUDA 메모리 최적화
            if self.device == "cuda":
                self.pipe.enable_attention_slicing()
                self.pipe.enable_memory_efficient_attention()
            
            logging.info("모델 로딩 완료")
            
        except Exception as e:
            logging.error(f"모델 로딩 실패: {e}")
            raise Exception(f"Stable Diffusion 모델 로딩 실패: {e}")
    
    def generate(self, prompt, negative_prompt=None, width=512, height=512, 
                num_inference_steps=20, guidance_scale=7.5, seed=None):
        """
        이미지 생성
        
        Args:
            prompt: 이미지 생성 프롬프트
            negative_prompt: 부정적 프롬프트
            width, height: 이미지 크기
            num_inference_steps: 추론 단계 수
            guidance_scale: 가이던스 스케일
            seed: 시드 값
            
        Returns:
            dict: 이미지 정보와 base64 데이터
        """
        try:
            logging.info(f"이미지 생성 시작: '{prompt[:50]}...'")
            
            # 기본 부정적 프롬프트 (동화책에 적합하지 않은 요소 제외)
            if negative_prompt is None:
                negative_prompt = "ugly, blurry, bad anatomy, bad proportions, deformed, mutated, disfigured, low quality, pixelated, nsfw, adult content, violence, scary, dark, horror"
            
            # 시드 설정
            if seed is not None:
                torch.manual_seed(seed)
            
            # 이미지 생성
            with torch.autocast(self.device):
                result = self.pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    num_images_per_prompt=1
                )
            
            image = result.images[0]
            
            # 이미지를 base64로 변환
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # 이미지를 파일로도 저장 (옵션)
            timestamp = str(int(torch.rand(1) * 1000000))
            filename = f"generated_image_{timestamp}.png"
            filepath = os.path.join(os.getcwd(), "temp", filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            image.save(filepath)
            
            logging.info(f"이미지 생성 완료: {filepath}")
            
            return {
                "image_base64": img_base64,
                "image_url": f"data:image/png;base64,{img_base64}",
                "filepath": filepath,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "seed": seed
            }
            
        except Exception as e:
            logging.error(f"이미지 생성 실패: {e}")
            # 폴백 이미지 (단색 placeholder)
            placeholder_img = Image.new('RGB', (width, height), color='lightgray')
            buffered = io.BytesIO()
            placeholder_img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return {
                "image_base64": img_base64,
                "image_url": f"data:image/png;base64,{img_base64}",
                "error": str(e),
                "prompt": prompt,
                "width": width,
                "height": height
            }
    
    def check_health(self):
        """모델 상태 확인"""
        try:
            test_result = self.generate("test image", num_inference_steps=1)
            return True, "이미지 모델 정상 작동"
        except Exception as e:
            return False, f"이미지 모델 오류: {e}"