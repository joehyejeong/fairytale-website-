# python/models/text_model.py
import ollama
import json
import logging

class TextModel:
    def __init__(self, model_name="gemma3:4b"):
        """
        Ollama 텍스트 모델 초기화
        
        Args:
            model_name: Ollama 모델 이름 (기본값: gemma2)
        """
        self.model_name = model_name
        print(f"🔗 TextModel 초기화 시작")
        print(f"🎯 요청된 모델명: {model_name}")
        print(f"🔗 Ollama 클라이언트 초기화 시작...")
        print(f"🌐 Ollama 서버 기본 주소: localhost:11434")
        
        try:
            # 환경변수에서 Ollama 서버 주소 확인
            import os
            ollama_host = os.environ.get('OLLAMA_HOST', 'localhost:11434')
            print(f"🌐 Ollama 서버 주소: {ollama_host}")
            
            # Ollama 모델 경로 확인
            ollama_models_path = os.environ.get('OLLAMA_MODELS_PATH', '/c/Users/eel8/.ollama/models')
            print(f"📁 Ollama 모델 경로: {ollama_models_path}")
            
            # 명시적으로 서버 주소 설정
            self.client = ollama.Client(host=ollama_host)
            print(f"✅ Ollama 클라이언트 초기화 완료")
        except Exception as e:
            print(f"❌ Ollama 클라이언트 초기화 실패: {e}")
            print(f"❌ 에러 상세: {str(e)}")
            raise
        
        self._validate_model()
    
    def _validate_model(self):
        """모델이 설치되어 있는지 확인"""
        try:
            print(f"🔍 모델 검증 시작")
            print(f"🎯 검증할 모델명: {self.model_name}")
            # 사용 가능한 모델 목록 확인
            models = self.client.list()
            print(f"📋 사용 가능한 모델 목록 조회 성공")
            
            # 응답 구조 안전하게 파싱
            if hasattr(models, 'models') and isinstance(models.models, list):
                # ListResponse 타입 처리
                model_names = [model.model for model in models.models if hasattr(model, 'model')]
            elif isinstance(models, dict) and 'models' in models:
                model_names = [model.get('model', '') for model in models['models']]
            elif isinstance(models, list):
                model_names = [model.get('model', '') for model in models]
            else:
                # 응답 구조를 로깅하여 확인
                logging.warning(f"예상치 못한 모델 응답 구조: {type(models)} - {models}")
                model_names = []
            
            logging.info(f"사용 가능한 모델: {model_names}")
            
            print(f"📋 사용 가능한 모델 목록: {model_names}")
            
            if not any(self.model_name in name for name in model_names):
                print(f"⚠️ 모델 '{self.model_name}'이 설치되지 않음")
                print(f"⚠️ 자동 다운로드 시도...")
                logging.warning(f"모델 {self.model_name}이 설치되지 않음. 자동 다운로드 시도...")
                self.client.pull(self.model_name)
                print(f"✅ 모델 '{self.model_name}' 다운로드 완료")
                logging.info(f"모델 {self.model_name} 다운로드 완료")
            else:
                print(f"✅ 모델 '{self.model_name}' 사용 준비 완료")
                print(f"✅ 모델 검증 성공!")
                logging.info(f"모델 {self.model_name} 사용 준비 완료")
                
        except Exception as e:
            print(f"❌ 모델 검증 실패: {e}")
            print(f"❌ 에러 타입: {type(e)}")
            logging.error(f"모델 검증 실패: {e}")
            # 모델 검증 실패해도 계속 진행 (generate 시도)
            print(f"⚠️ 모델 검증 실패했지만 계속 진행합니다: {e}")
            logging.warning(f"모델 검증 실패했지만 계속 진행합니다: {e}")
    
    def generate(self, prompt, max_tokens=1000, temperature=0.7):
        """
        텍스트 생성
        
        Args:
            prompt: 입력 프롬프트
            max_tokens: 최대 토큰 수
            temperature: 생성 온도 (0.0-1.0)
            
        Returns:
            str: 생성된 텍스트
        """
        try:
            # generate 함수 사용 (chat 대신)
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    'num_predict': max_tokens,
                    'temperature': temperature,
                    'top_p': 0.9,
                    'stop': ['</끝>', '<END>', '\n\n\n']
                }
            )
            
            # generate 응답 구조 파싱
            if isinstance(response, dict) and 'response' in response:
                result = response['response'].strip()
            elif hasattr(response, 'response'):
                # GenerateResponse 객체인 경우
                result = response.response.strip()
            else:
                # 응답 구조를 로깅하여 확인
                logging.warning(f"예상치 못한 generate 응답 구조: {type(response)} - {response}")
                result = str(response).strip()
            
            # 응답에서 실제 내용만 추출 (메타데이터 제거)
            if 'response' in result:
                # response 필드가 포함된 경우 실제 내용만 추출
                try:
                    # response: 뒤의 내용 찾기
                    import re
                    response_match = re.search(r"response['\"]?\s*:\s*['\"](.*?)['\"]", result, re.DOTALL)
                    if response_match:
                        result = response_match.group(1)
                        # 이스케이프된 문자 처리
                        result = result.replace('\\n', '\n').replace('\\"', '"')
                        logging.info(f"response 필드에서 내용 추출 성공, 길이: {len(result)}")
                    else:
                        logging.warning("response 필드 패턴을 찾을 수 없음")
                except Exception as e:
                    logging.warning(f"response 필드 처리 실패: {e}")
            
            # GenerateResponse 객체인 경우 response 속성 직접 사용
            if hasattr(response, 'response'):
                result = response.response
                logging.info(f"GenerateResponse.response 직접 사용, 길이: {len(result)}")
            
            logging.info(f"텍스트 생성 완료: {len(result)} 문자")
            return result
            
        except Exception as e:
            logging.error(f"텍스트 생성 실패: {e}")
            # 폴백 응답
            return f"AI 모델 호출 중 오류가 발생했습니다: {str(e)}"
    
    def check_health(self):
        """모델 상태 확인"""
        try:
            test_prompt = "안녕하세요"
            response = self.generate(test_prompt, max_tokens=10)
            return True, "모델 정상 작동"
        except Exception as e:
            return False, f"모델 오류: {e}"