# python/models/story_model.py - 동화책 생성 전용 모델
import os
import sys

class StoryModel:
    def __init__(self, model_name="gemma3:4b"):
        self.model_name = model_name
        self.client = None
        self.available = False
        
        print(f"StoryModel 초기화 시작: {model_name}", file=sys.stderr)
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
            print(f"StoryModel Ollama 연결 성공: {self.model_name}", file=sys.stderr)
            self.available = True
                
        except ImportError:
            print("ollama 패키지가 설치되지 않았습니다", file=sys.stderr)
            self.available = False
        except Exception as e:
            print(f"StoryModel Ollama 초기화 실패: {e}", file=sys.stderr)
            self.available = False
    
    def generate(self, prompt, max_tokens=2500, temperature=0.7):
        """동화책 생성 - 전체 응답 유지"""
        if not self.available or not self.client:
            return "모델을 사용할 수 없습니다. Ollama 서버가 실행 중인지 확인하세요."
        
        try:
            print(f"동화책 AI 생성 시작 (max_tokens: {max_tokens})", file=sys.stderr)
            
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
            
            print(f"동화책 원본 응답 길이: {len(raw_result)} 문자", file=sys.stderr)
            
            # 동화책용 정리 - 시스템 메시지만 제거, JSON 전체 유지
            cleaned_result = self._preserve_full_story_response(raw_result)
            print(f"동화책 정리된 응답 길이: {len(cleaned_result)} 문자", file=sys.stderr)
            
            return cleaned_result
                
        except Exception as e:
            error_msg = f"동화책 생성 중 오류: {str(e)}"
            print(error_msg, file=sys.stderr)
            return error_msg
    
    def _preserve_full_story_response(self, raw_response):
        """동화책용 응답 정리 - 6페이지 모두 보존"""
        try:
            print("동화책 응답 정리 시작 (전체 보존 모드)", file=sys.stderr)
            
            # 시스템 로그 패턴들
            system_patterns = [
                "사용 가능한 모델:",
                "StoryModel Ollama 연결 성공:",
                "StoryModel 초기화",
                "동화책 AI 생성 시작",
                "동화책 원본 응답 길이:",
                "동화책 정리된 응답 길이:",
                "TextModel 초기화",
                "AI 생성 시작"
            ]
            
            lines = raw_response.split('\n')
            cleaned_lines = []
            
            # 시스템 메시지가 포함된 라인만 제거
            for line in lines:
                line_stripped = line.strip()
                
                # 시스템 메시지 패턴 확인
                is_system_message = any(pattern in line for pattern in system_patterns)
                
                if not is_system_message and line_stripped:
                    cleaned_lines.append(line)
            
            # 정리된 라인들을 다시 합치기
            result = '\n'.join(cleaned_lines)
            
            # JSON 시작점만 찾기 (끝점은 찾지 않아서 전체 유지)
            json_start_pos = -1
            
            # JSON 시작 문자들 찾기
            for start_char in ['{', '[']:
                pos = result.find(start_char)
                if pos != -1:
                    if json_start_pos == -1 or pos < json_start_pos:
                        json_start_pos = pos
            
            if json_start_pos != -1:
                # 시작점부터 끝까지 모든 내용 포함 (6페이지 전체 보존)
                final_result = result[json_start_pos:].strip()
                print(f"동화책 JSON 전체 보존: {len(final_result)} 문자", file=sys.stderr)
                
                # 6페이지가 모두 있는지 확인
                page_count = final_result.count('"page":')
                print(f"동화책 페이지 수 확인: {page_count}개 페이지 발견", file=sys.stderr)
                
                if page_count >= 6:
                    print("✅ 6페이지 모두 포함됨", file=sys.stderr)
                else:
                    print(f"⚠️ 페이지 부족: {page_count}개만 발견", file=sys.stderr)
                
                return final_result
            else:
                print("동화책 JSON 시작점을 찾을 수 없어 전체 응답 반환", file=sys.stderr)
                return result.strip()
                
        except Exception as e:
            print(f"동화책 응답 정리 중 오류: {e}", file=sys.stderr)
            return raw_response.strip()