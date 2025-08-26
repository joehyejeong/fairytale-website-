# python/formatters/story_formatter.py
import json
import re
import sys

def extract_json_from_response(raw_response):
    """응답에서 [{}] 형태의 JSON 배열 추출"""
    try:
        # 0단계: JSON 코드 블록 (```json ... ```) 처리
        if '```json' in str(raw_response):
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', str(raw_response), re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                try:
                    result = json.loads(json_str)
                    return result
                except json.JSONDecodeError:
                    pass
        
        # 1단계: [로 시작하는 JSON 배열 찾기
        if '[' in str(raw_response) and ']' in str(raw_response):
            start_idx = str(raw_response).find('[')
            end_idx = str(raw_response).rfind(']') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = str(raw_response)[start_idx:end_idx]
                
                try:
                    parsed = json.loads(json_str)
                    
                    # 배열이고 첫 번째 요소가 있는 경우
                    if isinstance(parsed, list) and len(parsed) > 0:
                        return parsed[0]  # 첫 번째 요소 반환
                except json.JSONDecodeError:
                    pass
        
        # 2단계: {} 형태의 단일 JSON 객체 찾기
        if '{' in str(raw_response) and '}' in str(raw_response):
            start_idx = str(raw_response).find('{')
            end_idx = str(raw_response).rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = str(raw_response)[start_idx:end_idx]
                
                try:
                    result = json.loads(json_str)
                    return result
                except json.JSONDecodeError:
                    pass
        
        return None
        
    except Exception as e:
        print(f"JSON 추출 실패: {e}", file=sys.stderr)
        return None

def format_expanded_story(raw_response, original_idea, style):
    """줄거리 확장 결과 포맷팅 - 간단한 버전"""
    try:
        # JSON 추출
        parsed_data = extract_json_from_response(raw_response)
        
        if parsed_data:
            # JSON 파싱 성공 - 원본 데이터 그대로 반환
            return parsed_data
        else:
            # JSON 파싱 실패 시 원본 응답 그대로 반환
            return raw_response
        
    except Exception as e:
        # 에러 시 원본 응답 그대로 반환
        return raw_response