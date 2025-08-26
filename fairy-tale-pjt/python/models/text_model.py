# python/models/text_model.py - Ollama 전용 (완전한 코드)
import os
import sys

class TextModel:
    def __init__(self, model_name="gemma3:4b"):
        self.model_name = model_name
        self.client = None
        self.available = False
        
        print(f"TextModel 초기화 시작: {model_name}", file=sys.stderr)
        self._initialize_ollama()
    
    def _initialize_ollama(self):
        """Ollama 초기화"""
        try:
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
                model_names = [model.get('model', '') for model in models['models']]
            else:
                model_names = []
            
            print(f"사용 가능한 모델: {model_names}", file=sys.stderr)
            
            # 필요한 모델 확인
            if not any(self.model_name in name for name in model_names):
                print(f"모델 {self.model_name}을 찾을 수 없습니다", file=sys.stderr)
                print(f"다운로드: ollama pull {self.model_name}", file=sys.stderr)
                # 자동 다운로드 시도하지 않음 (시간이 오래 걸리므로)
            
            print(f"Ollama 연결 성공: {self.model_name}", file=sys.stderr)
            self.available = True
                
        except ImportError:
            print("ollama 패키지가 설치되지 않았습니다", file=sys.stderr)
            print("설치: pip install ollama", file=sys.stderr)
            self.available = False
        except Exception as e:
            print(f"Ollama 초기화 실패: {e}", file=sys.stderr)
            self.available = False
    
    def generate(self, prompt, max_tokens=1000, temperature=0.7):
        """텍스트 생성 - 응답 정리"""
        if not self.available or not self.client:
            return "모델을 사용할 수 없습니다. Ollama 서버가 실행 중인지 확인하세요."
        
        try:
            print(f"AI 생성 시작 (max_tokens: {max_tokens}, temperature: {temperature})", file=sys.stderr)
            
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
            
            print(f"원본 응답 길이: {len(raw_result)} 문자", file=sys.stderr)
            
            # 응답 정리 - 시스템 메시지 제거하고 JSON만 추출
            cleaned_result = self._clean_response(raw_result)
            
            print(f"정리된 응답 길이: {len(cleaned_result)} 문자", file=sys.stderr)
            
            return cleaned_result
                
        except Exception as e:
            error_msg = f"텍스트 생성 중 오류: {str(e)}"
            print(error_msg, file=sys.stderr)
            return error_msg
    
    def _clean_response(self, raw_response):
        """응답에서 시스템 메시지 제거하고 JSON만 추출"""
        try:
            print("응답 정리 시작", file=sys.stderr)
            
            # JSON 배열이나 객체 시작점 찾기
            json_start = -1
            
            # 1. 대괄호부터 찾기 (JSON 배열)
            bracket_pos = raw_response.find('[')
            
            # 2. 중괄호 찾기 (JSON 객체)
            brace_pos = raw_response.find('{')
            
            # 대괄호가 있고, 중괄호보다 먼저 나오면 대괄호 사용
            if bracket_pos != -1 and (brace_pos == -1 or bracket_pos < brace_pos):
                json_start = bracket_pos
                print(f"JSON 배열 시작점 발견: {json_start}", file=sys.stderr)
            elif brace_pos != -1:
                json_start = brace_pos
                print(f"JSON 객체 시작점 발견: {json_start}", file=sys.stderr)
            
            if json_start != -1:
                # JSON 부분만 추출
                json_part = raw_response[json_start:].strip()
                
                # JSON 종료점도 찾아서 더 정확하게 추출
                if json_part.startswith('['):
                    # 배열 종료점 찾기
                    bracket_count = 0
                    end_pos = -1
                    for i, char in enumerate(json_part):
                        if char == '[':
                            bracket_count += 1
                        elif char == ']':
                            bracket_count -= 1
                            if bracket_count == 0:
                                end_pos = i + 1
                                break
                    
                    if end_pos != -1:
                        json_part = json_part[:end_pos]
                        
                elif json_part.startswith('{'):
                    # 객체 종료점 찾기
                    brace_count = 0
                    end_pos = -1
                    for i, char in enumerate(json_part):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                    
                    if end_pos != -1:
                        json_part = json_part[:end_pos]
                
                print(f"최종 JSON 추출: {json_part[:100]}...", file=sys.stderr)
                return json_part
            else:
                # JSON을 찾을 수 없으면 원본 반환
                print("JSON을 찾을 수 없어 원본 반환", file=sys.stderr)
                return raw_response.strip()
                
        except Exception as e:
            print(f"응답 정리 중 오류: {e}", file=sys.stderr)
            return raw_response.strip()
    
    def check_health(self):
        """모델 상태 확인"""
        if not self.available:
            return False, "모델이 초기화되지 않았습니다"
        
        try:
            test_response = self.generate("안녕하세요", max_tokens=20)
            return True, f"모델 정상 작동: {test_response[:50]}..."
        except Exception as e:
            return False, f"모델 오류: {str(e)}"