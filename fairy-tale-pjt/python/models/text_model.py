# python/models/text_model.py - GPU 우선 실행이 추가된 수정된 버전
import os
import sys
import torch


class TextModel:
    def __init__(self, model_name="gemma3:4b"):
        self.model_name = model_name
        self.client = None
        self.available = False
        self.use_local_gpu = False
        self.local_model = None
        self.tokenizer = None

        # GPU 환경 체크
        self.device, self.torch_dtype = self._setup_device()

        print(f"TextModel 초기화 시작: {model_name}", file=sys.stderr)
        print(
            f"디바이스: {self.device}, Torch dtype: {self.torch_dtype}", file=sys.stderr)

        # GPU 우선 시도 후 Ollama 폴백
        self._initialize_models()

    def _setup_device(self):
        """GPU/CPU 환경 설정"""
        print("=== 텍스트 모델 GPU/CPU 환경 체크 ===", file=sys.stderr)

        if torch.cuda.is_available():
            device = "cuda"
            torch_dtype = torch.float16

            gpu_count = torch.cuda.device_count()
            current_gpu = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(
                0).total_memory / (1024**3)

            print(f"CUDA 사용 가능", file=sys.stderr)
            print(f"   GPU: {current_gpu}", file=sys.stderr)
            print(f"   GPU 메모리: {gpu_memory:.1f}GB", file=sys.stderr)

            if gpu_memory < 4.0:
                print(
                    f"GPU 메모리가 {gpu_memory:.1f}GB로 부족할 수 있습니다", file=sys.stderr)
        else:
            device = "cpu"
            torch_dtype = torch.float32
            print("CUDA 사용 불가능 - CPU 모드", file=sys.stderr)

            # Apple Silicon MPS 체크
            if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                device = "mps"
                torch_dtype = torch.float16
                print("Apple Silicon MPS 사용 가능", file=sys.stderr)

        return device, torch_dtype

    def _initialize_models(self):
        """GPU 로컬 모델 우선 시도 후 Ollama 폴백"""
        # 1. GPU 로컬 모델 시도
        if self.device in ["cuda", "mps"]:
            print("GPU 로컬 모델 로드 시도 중...", file=sys.stderr)
            if self._try_load_local_model():
                print("GPU 로컬 모델 로드 성공", file=sys.stderr)
                self.use_local_gpu = True
                self.available = True
                return
            else:
                print("GPU 로컬 모델 로드 실패, Ollama로 폴백", file=sys.stderr)

        # 2. Ollama 폴백
        print("Ollama 모델 초기화 시도 중...", file=sys.stderr)
        self._initialize_ollama()

    def _try_load_local_model(self):
        """로컬 GPU 모델 로드 시도"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM

            # 가벼운 한국어 지원 모델 시도
            model_candidates = [
                "microsoft/DialoGPT-medium",  # 대화 특화
                "EleutherAI/gpt-neo-1.3B",    # 중간 크기
                "microsoft/DialoGPT-small"    # 가장 가벼운 버전
            ]

            for model_name in model_candidates:
                try:
                    print(f"로컬 모델 시도: {model_name}", file=sys.stderr)

                    self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                    self.local_model = AutoModelForCausalLM.from_pretrained(
                        model_name,
                        torch_dtype=self.torch_dtype,
                        device_map="auto" if self.device == "cuda" else None
                    )

                    if self.device != "cuda":
                        self.local_model = self.local_model.to(self.device)

                    # 패딩 토큰 설정
                    if self.tokenizer.pad_token is None:
                        self.tokenizer.pad_token = self.tokenizer.eos_token

                    print(f"로컬 모델 로드 성공: {model_name}", file=sys.stderr)
                    return True

                except Exception as e:
                    print(f"로컬 모델 {model_name} 로드 실패: {e}", file=sys.stderr)
                    continue

            return False

        except ImportError:
            print("transformers 라이브러리가 없습니다. pip install transformers",
                  file=sys.stderr)
            return False
        except Exception as e:
            print(f"로컬 모델 로드 실패: {e}", file=sys.stderr)
            return False

    def _initialize_ollama(self):
        """Ollama 초기화"""
        try:
            self._setup_ollama_path()
            import ollama

            # Ollama 클라이언트 생성
            host = os.environ.get('OLLAMA_HOST', 'localhost:11434')
            self.client = ollama.Client(host=host)

            # 연결 테스트
            models = self.client.list()

            # 응답 구조 파싱
            if hasattr(models, 'models'):
                model_names = [model.model for model in models.models]
            elif isinstance(models, dict) and 'models' in models:
                model_names = [model.get('model', '')
                               for model in models['models']]
            else:
                model_names = []

            print(f"사용 가능한 Ollama 모델: {model_names}", file=sys.stderr)

            # 필요한 모델 확인
            if not any(self.model_name in name for name in model_names):
                print(f"모델 {self.model_name}을 찾을 수 없습니다", file=sys.stderr)
                print(f"다운로드: ollama pull {self.model_name}", file=sys.stderr)

            print(f"Ollama 연결 성공: {self.model_name}", file=sys.stderr)
            self.available = True

        except ImportError:
            print("ollama 패키지가 설치되지 않았습니다", file=sys.stderr)
            print("설치: pip install ollama", file=sys.stderr)
            self.available = False
        except Exception as e:
            print(f"Ollama 초기화 실패: {e}", file=sys.stderr)
            self.available = False

    def _setup_ollama_path(self):
        """USB 우선 Ollama 모델 경로 설정"""
        from pathlib import Path

        # USB에서 Ollama 모델 경로 찾기
        current_script = Path(__file__)
        for parent in [current_script.parent] + list(current_script.parents):
            usb_ollama = parent / "models" / "text-models" / "ollama"
            if usb_ollama.exists():
                os.environ["OLLAMA_MODELS"] = str(usb_ollama)
                print(f"USB Ollama 경로 설정: {usb_ollama}", file=sys.stderr)
                return

        print("USB Ollama 경로를 찾을 수 없음, 기본 경로 사용", file=sys.stderr)

    def generate(self, prompt, max_tokens=2000, temperature=0.7):
        """텍스트 생성 - GPU 로컬 모델 우선, Ollama 폴백"""
        if not self.available:
            return "텍스트 모델을 사용할 수 없습니다."

        # GPU 로컬 모델 사용
        if self.use_local_gpu and self.local_model is not None:
            return self._generate_with_local_model(prompt, max_tokens, temperature)

        # Ollama 폴백
        return self._generate_with_ollama(prompt, max_tokens, temperature)

    def _generate_with_local_model(self, prompt, max_tokens=2000, temperature=0.7):
        """로컬 GPU 모델로 생성"""
        try:
            print(
                f"로컬 GPU 모델 생성 시작 (max_tokens: {max_tokens})", file=sys.stderr)

            # GPU 메모리 정리
            if self.device == "cuda":
                torch.cuda.empty_cache()

            # 토큰화
            inputs = self.tokenizer.encode(
                prompt, return_tensors="pt", truncation=True, max_length=1024)
            inputs = inputs.to(self.device)

            # 생성 파라미터
            generation_kwargs = {
                "max_new_tokens": min(max_tokens, 512),  # 로컬 모델은 짧게
                "temperature": temperature,
                "do_sample": True,
                "top_p": 0.9,
                "top_k": 50,
                "pad_token_id": self.tokenizer.eos_token_id,
            }

            # 생성
            with torch.inference_mode():
                outputs = self.local_model.generate(
                    inputs, **generation_kwargs)

            # 디코딩
            response = self.tokenizer.decode(
                outputs[0], skip_special_tokens=True)

            # 원본 프롬프트 제거
            if response.startswith(prompt):
                response = response[len(prompt):].strip()

            # GPU 메모리 정리
            if self.device == "cuda":
                torch.cuda.empty_cache()

            print(f"로컬 GPU 모델 생성 완료: {len(response)} 문자", file=sys.stderr)
            return response

        except Exception as e:
            print(f"로컬 GPU 모델 생성 실패: {e}", file=sys.stderr)
            # Ollama로 폴백
            if self.client:
                print("Ollama로 폴백 시도", file=sys.stderr)
                return self._generate_with_ollama(prompt, max_tokens, temperature)
            return f"텍스트 생성 실패: {str(e)}"

    def _generate_with_ollama(self, prompt, max_tokens=2000, temperature=0.7):
        """Ollama로 생성 (기존 로직)"""
        if not self.client:
            return "Ollama 모델을 사용할 수 없습니다."

        try:
            print(f"Ollama 생성 시작 (max_tokens: {max_tokens})", file=sys.stderr)

            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    'num_predict': max_tokens,
                    'temperature': temperature,
                    'top_p': 0.9,
                    'stop': ['</끝>', '<END>']
                }
            )

            # 응답 추출
            if hasattr(response, 'response'):
                raw_result = response.response
            elif isinstance(response, dict) and 'response' in response:
                raw_result = response['response']
            else:
                raw_result = str(response)

            cleaned_result = self._remove_system_messages_only(raw_result)
            print(f"Ollama 생성 완료: {len(cleaned_result)} 문자", file=sys.stderr)
            return cleaned_result

        except Exception as e:
            error_msg = f"Ollama 텍스트 생성 중 오류: {str(e)}"
            print(error_msg, file=sys.stderr)
            return error_msg

    def translate(self, text, target_language="english", max_tokens=500):
        """번역 전용 함수"""
        if not self.available:
            return f"{text} (translation unavailable)"

        print(f"번역 시작: {text[:50]}... -> {target_language}", file=sys.stderr)

        # 번역용 프롬프트 생성
        if target_language.lower() == "english":
            prompt = f"""Translate the following Korean text to English. 
Focus on visual descriptions as this is for image generation.
Provide only the translation result without additional explanations.

Korean text: {text}

English translation:"""
        else:
            prompt = f"""Translate the following Korean text to {target_language}.
Provide only the translation result.

Korean text: {text}

Translation:"""

        # GPU 로컬 모델 사용 (번역에 특화된 짧은 생성)
        if self.use_local_gpu and self.local_model is not None:
            try:
                result = self._generate_with_local_model(
                    prompt, max_tokens=200, temperature=0.3)
                translated = self._clean_translation_result(result, text)
                print(f"로컬 모델 번역 완료: {translated[:50]}...", file=sys.stderr)
                return translated
            except Exception as e:
                print(f"로컬 모델 번역 실패, Ollama로 폴백: {e}", file=sys.stderr)

        # Ollama 폴백
        if self.client:
            try:
                response = self.client.generate(
                    model=self.model_name,
                    prompt=prompt,
                    options={
                        'num_predict': max_tokens,
                        'temperature': 0.3,  # 번역은 낮은 temperature
                        'top_p': 0.8
                    }
                )

                # 응답 추출
                if hasattr(response, 'response'):
                    raw_result = response.response
                elif isinstance(response, dict) and 'response' in response:
                    raw_result = response['response']
                else:
                    raw_result = str(response)

                translated = self._clean_translation_result(raw_result, text)
                print(f"Ollama 번역 완료: {translated[:50]}...", file=sys.stderr)
                return translated

            except Exception as e:
                print(f"번역 중 오류: {e}", file=sys.stderr)
                return f"{text} (translation error)"

        return f"{text} (no translation service available)"

    def _clean_translation_result(self, raw_result, original_text):
        """번역 결과 정리"""
        try:
            result = raw_result.strip()

            # 일반적인 번역 접두사들 제거
            prefixes_to_remove = [
                "English translation:",
                "Translation:",
                "번역 결과:",
                "영어 번역:",
                "Result:",
                "Answer:"
            ]

            for prefix in prefixes_to_remove:
                if result.lower().startswith(prefix.lower()):
                    result = result[len(prefix):].strip()

            # 따옴표 제거
            if result.startswith('"') and result.endswith('"'):
                result = result[1:-1]
            if result.startswith("'") and result.endswith("'"):
                result = result[1:-1]

            # 빈 결과 처리
            if not result or result.lower() in ['none', 'null', '없음']:
                return original_text

            # 너무 긴 결과 자르기
            if len(result) > len(original_text) * 3:
                result = result[:len(original_text) * 2] + "..."

            return result

        except Exception as e:
            print(f"번역 결과 정리 중 오류: {e}", file=sys.stderr)
            return raw_result.strip()

    def _remove_system_messages_only(self, raw_response):
        """시스템 메시지만 제거하고 JSON은 그대로 유지"""
        try:
            system_patterns = [
                "사용 가능한 모델:",
                "Ollama 연결 성공:",
                "TextModel 초기화",
                "AI 생성 시작",
                "원본 응답 길이:",
                "정리된 응답 길이:"
            ]

            lines = raw_response.split('\n')
            cleaned_lines = []

            for line in lines:
                if any(pattern in line for pattern in system_patterns):
                    continue
                cleaned_lines.append(line)

            result = '\n'.join(cleaned_lines)

            # JSON 시작점만 찾기
            json_start_pos = -1
            for start_char in ['{', '[']:
                pos = result.find(start_char)
                if pos != -1:
                    if json_start_pos == -1 or pos < json_start_pos:
                        json_start_pos = pos

            if json_start_pos != -1:
                final_result = result[json_start_pos:].strip()
                return final_result
            else:
                return result.strip()

        except Exception as e:
            print(f"응답 정리 중 오류: {e}", file=sys.stderr)
            return raw_response.strip()

    def check_health(self):
        """모델 상태 확인"""
        if not self.available:
            return False, "모델이 초기화되지 않았습니다"

        try:
            model_type = "로컬 GPU" if self.use_local_gpu else "Ollama"
            test_response = self.generate("안녕하세요", max_tokens=20)
            return True, f"{model_type} 모델 정상 작동: {test_response[:50]}..."
        except Exception as e:
            return False, f"모델 오류: {str(e)}"
