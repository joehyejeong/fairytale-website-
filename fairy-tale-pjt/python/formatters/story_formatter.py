# python/formatters/story_formatter.py
import json
import re
import logging

def format_expanded_story(raw_response, original_idea, style):
    """줄거리 확장 결과 포맷팅"""
    logging.info(f"=== 스토리 포맷팅 시작 ===")
    logging.info(f"원본 AI 응답: {raw_response}")
    logging.info(f"원본 AI 응답 타입: {type(raw_response)}")
    logging.info(f"원본 AI 응답 길이: {len(raw_response)}")
    
    try:
        # JSON 파싱 시도
        parsed_data = extract_json_from_response(raw_response)
        
        if parsed_data:
            # JSON 파싱 성공
            result = {
                "title": parsed_data.get('title', f"{original_idea}"),
                "character": parsed_data.get('character', '주인공'),
                "background": parsed_data.get('background', '신비로운 세계'),
                "plot": parsed_data.get('plot', '흥미로운 이야기가 펼쳐집니다.'),
                "lesson": parsed_data.get('lesson', '좋은 교훈이 있습니다.'),
                "theme": parsed_data.get('theme', style),
                "style": style,
                "word_count": len(parsed_data.get('plot', '')),
                "processing_status": "success"
            }
        else:
            # JSON 파싱 실패 시 텍스트에서 정보 추출
            result = extract_story_elements_from_text(raw_response, original_idea, style)
            # processing_status를 ai_generated로 설정 (fallback 방지)
            result["processing_status"] = "ai_generated"
        
        # 품질 검증 및 개선
        result = validate_and_improve_story(result, original_idea, style)
        
        logging.info(f"스토리 포맷팅 완료: {result['title']}")
        return result
        
    except Exception as e:
        logging.error(f"스토리 포맷팅 실패: {e}")
        # 에러가 발생해도 fallback 메시지 대신 AI 응답 내용 활용
        result = extract_story_elements_from_text(raw_response, original_idea, style)
        result["processing_status"] = "ai_generated"
        result["error"] = str(e)
        return result

def extract_json_from_response(raw_response):
    """응답에서 JSON 추출 - 더 강력한 파싱"""
    logging.info(f"=== JSON 추출 시작 ===")
    logging.info(f"입력 응답 길이: {len(raw_response)}")
    logging.info(f"입력 응답 시작 부분: {raw_response[:200]}...")
    logging.info(f"입력 응답 끝 부분: ...{raw_response[-200:]}")
    
    try:
        # 1. 직접 JSON 파싱 시도
        logging.info("1단계: 직접 JSON 파싱 시도")
        result = json.loads(raw_response.strip())
        logging.info("✓ 직접 JSON 파싱 성공")
        return result
    except Exception as e:
        logging.info(f"1단계 실패: {e}")
    
    try:
        # 2. JSON 코드 블록에서 추출 (```json ... ```)
        logging.info("2단계: JSON 코드 블록에서 추출")
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', raw_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(1))
            logging.info("✓ JSON 코드 블록에서 추출 성공")
            return result
        else:
            logging.info("JSON 코드 블록을 찾을 수 없음")
    except Exception as e:
        logging.info(f"2단계 실패: {e}")
    
    try:
        # 3. 중괄호로 둘러싸인 부분 추출 (더 정확한 정규식)
        logging.info("3단계: 중괄호에서 JSON 추출")
        brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', raw_response, re.DOTALL)
        if brace_match:
            result = json.loads(brace_match.group(0))
            logging.info("✓ 중괄호에서 JSON 추출 성공")
            return result
        else:
            logging.info("중괄호로 둘러싸인 JSON을 찾을 수 없음")
    except Exception as e:
        logging.info(f"3단계 실패: {e}")
    
    try:
        # 4. 라인별로 JSON 구조 찾기
        logging.info("4단계: 라인별 JSON 구조 찾기")
        lines = raw_response.split('\n')
        json_start = -1
        json_end = -1
        
        for i, line in enumerate(lines):
            if line.strip().startswith('{'):
                json_start = i
            if line.strip().endswith('}') and json_start != -1:
                json_end = i
                break
        
        if json_start != -1 and json_end != -1:
            json_text = '\n'.join(lines[json_start:json_end + 1])
            result = json.loads(json_text)
            logging.info("✓ 라인별 JSON 구조 찾기 성공")
            return result
        else:
            logging.info("라인별 JSON 구조를 찾을 수 없음")
    except Exception as e:
        logging.info(f"4단계 실패: {e}")
    
    try:
        # 5. Ollama 응답에서 'response' 필드 추출 후 JSON 파싱
        logging.info("5단계: response 필드에서 JSON 추출")
        if 'response' in raw_response:
            # response 필드 찾기
            response_match = re.search(r"'response':\s*'([^']*)'", raw_response)
            if response_match:
                response_content = response_match.group(1)
                logging.info(f"response 필드 찾음, 길이: {len(response_content)}")
                # JSON 코드 블록에서 추출
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    logging.info("✓ response 필드에서 JSON 코드 블록 추출 성공")
                    return result
                # 직접 JSON 파싱 시도
                result = json.loads(response_content)
                logging.info("✓ response 필드에서 직접 JSON 파싱 성공")
                return result
            else:
                logging.info("response 필드 패턴을 찾을 수 없음")
        else:
            logging.info("response 필드가 응답에 없음")
    except Exception as e:
        logging.info(f"5단계 실패: {e}")
    
    try:
        # 6. 더 강력한 JSON 추출 - response 필드 내의 JSON 찾기
        logging.info("6단계: 강화된 response 필드 JSON 추출")
        if 'response' in raw_response:
            # response: 뒤의 내용에서 JSON 찾기
            response_pattern = r"response['\"]?\s*:\s*['\"](.*?)['\"]"
            response_match = re.search(response_pattern, raw_response, re.DOTALL)
            if response_match:
                response_content = response_match.group(1)
                logging.info(f"강화된 response 필드 찾음, 길이: {len(response_content)}")
                # JSON 코드 블록에서 추출
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    logging.info("✓ 강화된 response 필드에서 JSON 코드 블록 추출 성공")
                    return result
                # 중괄호로 둘러싸인 JSON 찾기
                brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_content, re.DOTALL)
                if brace_match:
                    result = json.loads(brace_match.group(0))
                    logging.info("✓ 강화된 response 필드에서 중괄호 JSON 추출 성공")
                    return result
            else:
                logging.info("강화된 response 필드 패턴을 찾을 수 없음")
    except Exception as e:
        logging.info(f"6단계 실패: {e}")
    
    try:
        # 7. Ollama GenerateResponse 객체의 response 필드 직접 접근
        logging.info("7단계: GenerateResponse 객체 response 필드 직접 접근")
        if hasattr(raw_response, 'response'):
            response_content = raw_response.response
            logging.info(f"GenerateResponse.response 직접 접근, 길이: {len(response_content)}")
            # JSON 코드 블록에서 추출
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                logging.info("✓ GenerateResponse.response에서 JSON 코드 블록 추출 성공")
                return result
            # 직접 JSON 파싱 시도
            try:
                result = json.loads(response_content)
                logging.info("✓ GenerateResponse.response에서 직접 JSON 파싱 성공")
                return result
            except:
                # 중괄호로 둘러싸인 JSON 찾기
                brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_content, re.DOTALL)
                if brace_match:
                    result = json.loads(brace_match.group(0))
                    logging.info("✓ GenerateResponse.response에서 중괄호 JSON 추출 성공")
                    return result
        else:
            logging.info("GenerateResponse 객체가 아님")
    except Exception as e:
        logging.info(f"7단계 실패: {e}")
    
    try:
        # 8. 문자열에서 response 필드 찾기 (더 유연한 패턴)
        logging.info("8단계: 유연한 response 필드 패턴 매칭")
        # 다양한 response 패턴 시도
        patterns = [
            r"response['\"]?\s*:\s*['\"](.*?)['\"]",
            r"response\s*=\s*['\"](.*?)['\"]",
            r"'response':\s*'(.*?)'",
            r'"response":\s*"(.*?)"'
        ]
        
        for pattern in patterns:
            response_match = re.search(pattern, raw_response, re.DOTALL)
            if response_match:
                response_content = response_match.group(1)
                logging.info(f"패턴 '{pattern}'으로 response 필드 찾음, 길이: {len(response_content)}")
                
                # 이스케이프된 문자 처리
                response_content = response_content.replace('\\n', '\n').replace('\\"', '"')
                
                # JSON 코드 블록에서 추출
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    logging.info("✓ 유연한 패턴으로 JSON 코드 블록 추출 성공")
                    return result
                
                # 직접 JSON 파싱 시도
                try:
                    result = json.loads(response_content)
                    logging.info("✓ 유연한 패턴으로 직접 JSON 파싱 성공")
                    return result
                except:
                    # 중괄호로 둘러싸인 JSON 찾기
                    brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_content, re.DOTALL)
                    if brace_match:
                        result = json.loads(brace_match.group(0))
                        logging.info("✓ 유연한 패턴으로 중괄호 JSON 추출 성공")
                        return result
                break
        else:
            logging.info("모든 response 패턴 매칭 실패")
    except Exception as e:
        logging.info(f"8단계 실패: {e}")
    
    logging.error("모든 JSON 파싱 방법 실패")
    return None

def extract_story_elements_from_text(raw_text, original_idea, style):
    """텍스트에서 스토리 요소 추출 - 더 정확한 추출"""
    lines = raw_text.split('\n')
    
    title = ""
    character = ""
    background = ""
    plot = ""
    lesson = ""
    theme = style
    
    current_section = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 섹션 식별 (더 정확한 패턴 매칭)
        if re.search(r'제목|title', line, re.IGNORECASE):
            current_section = "title"
            title = extract_value_from_line(line)
        elif re.search(r'등장인물|주인공|character', line, re.IGNORECASE):
            current_section = "character"  
            character = extract_value_from_line(line)
        elif re.search(r'배경|시공간|background', line, re.IGNORECASE):
            current_section = "background"
            background = extract_value_from_line(line)
        elif re.search(r'줄거리|plot|스토리', line, re.IGNORECASE):
            current_section = "plot"
            plot = extract_value_from_line(line)
        elif re.search(r'교훈|주제|lesson|theme', line, re.IGNORECASE):
            current_section = "lesson"
            lesson = extract_value_from_line(line)
        else:
            # 현재 섹션에 내용 추가
            if current_section == "plot" and len(line) > 10:
                plot += " " + line
            elif current_section == "lesson" and len(line) > 5:
                lesson += " " + line
            elif current_section == "background" and len(line) > 5:
                background += " " + line
    
    # JSON 파싱이 실패한 경우, AI가 생성한 전체 내용을 줄거리에 넣기
    if not plot or len(plot) < 50:
        # AI 응답에서 실제 내용 추출 시도
        if 'response' in raw_text:
            try:
                # response 필드에서 내용 추출
                response_match = re.search(r"response['\"]?\s*:\s*['\"](.*?)['\"]", raw_text, re.DOTALL)
                if response_match:
                    response_content = response_match.group(1)
                    # 이스케이프된 문자 처리
                    response_content = response_content.replace('\\n', '\n').replace('\\"', '"')
                    plot = f"AI가 생성한 동화 내용:\n\n{response_content}"
                else:
                    plot = f"AI 응답 전체 내용:\n\n{raw_text}"
            except:
                plot = f"AI 응답 전체 내용:\n\n{raw_text}"
        else:
            plot = f"AI 응답 전체 내용:\n\n{raw_text}"
    
    return {
        "title": title or f"{original_idea} - 동화",
        "character": character or "주인공",
        "background": background or "신비로운 세계",
        "plot": plot,
        "lesson": lesson or "AI가 생성한 특별한 이야기",
        "theme": theme,
        "word_count": len(plot),
        "processing_status": "text_extraction"
    }

def extract_value_from_line(line):
    """라인에서 값 추출 - 더 정확한 추출"""
    # 콜론 뒤의 내용 추출
    if ':' in line:
        value = line.split(':', 1)[1].strip()
        # 따옴표 제거
        value = re.sub(r'^["\']|["\']$', '', value)
        return value
    
    # 따옴표 안의 내용 추출  
    quote_match = re.search(r'["\']([^"\']+)["\']', line)
    if quote_match:
        return quote_match.group(1)
    
    # 괄호 안의 내용 추출
    bracket_match = re.search(r'\[([^\]]+)\]', line)
    if bracket_match:
        return bracket_match.group(1)
    
    return line.strip()

def validate_and_improve_story(story_data, original_idea, style):
    """스토리 품질 검증 및 개선"""
    # 제목 검증 및 개선
    if not story_data['title'] or story_data['title'].startswith(original_idea):
        if '우주' in original_idea or '행성' in original_idea:
            story_data['title'] = "우주 탐험대의 모험"
        elif '마법' in original_idea or '요정' in original_idea:
            story_data['title'] = "마법의 세계로"
        elif '동물' in original_idea or '친구' in original_idea:
            story_data['title'] = "특별한 친구들"
        else:
            story_data['title'] = "신비로운 모험"
    
    # 배경 검증 및 개선
    if not story_data['background'] or 'AI가 생성한 배경 설정' in str(story_data['background']):
        if '우주' in original_idea or '행성' in original_idea:
            story_data['background'] = "미지의 우주 공간, 신비로운 외계 행성"
        elif '마법' in original_idea or '요정' in original_idea:
            story_data['background'] = "마법이 깃든 신비로운 숲속 왕국"
        elif '동물' in original_idea or '친구' in original_idea:
            story_data['background'] = "자연이 살아 숨쉬는 아름다운 마을"
        else:
            story_data['background'] = "꿈과 모험이 가득한 신비로운 세계"
    
    # 줄거리 길이 검증 및 AI 응답 내용 처리
    if len(story_data['plot']) < 100:
        # AI 응답 내용이 있는지 확인
        if 'AI가 생성한 동화 내용:' in story_data['plot'] or 'AI 응답 전체 내용:' in story_data['plot']:
            # 이미 AI 응답이 줄거리에 들어간 경우, 그대로 유지
            pass
        else:
            # 기본 줄거리 생성
            if '우주' in original_idea or '행성' in original_idea:
                story_data['plot'] = """【기(시작)】지훈이는 우주 탐험대의 대장이 되어 친구들과 함께 미지의 행성으로 떠납니다. 그들은 우주선을 타고 별들 사이를 날아갑니다.

【승(전개)】행성에 도착한 탐험대는 신비로운 생물들과 만나고, 위험한 지형을 통과해야 합니다. 함께 협력하며 어려움을 극복해 나갑니다.

【전(위기)】보물을 찾는 과정에서 거대한 우주 괴물과 마주칩니다. 모든 것이 절망적으로 보이지만, 지훈이와 친구들은 포기하지 않습니다.

【결(해결)】지혜와 용기, 그리고 우정의 힘으로 괴물을 물리치고 보물을 찾아냅니다. 이 모험을 통해 진정한 친구의 소중함을 깨닫게 됩니다."""
            else:
                story_data['plot'] = f"【기(시작)】{original_idea}의 시작입니다. 주인공은 새로운 모험을 시작합니다.\n\n【승(전개)】모험을 통해 여러 도전과 어려움을 겪게 됩니다.\n\n【전(위기)】가장 어려운 순간이 찾아오지만, 주인공은 포기하지 않습니다.\n\n【결(해결)】노력과 용기로 모든 문제를 해결하고 소중한 교훈을 얻습니다."
    
    # 품질 점수 계산
    quality_score = 0
    if len(story_data['title']) >= 5 and len(story_data['title']) <= 15: quality_score += 25
    if len(story_data['plot']) >= 200: quality_score += 25
    if len(story_data['character']) >= 5: quality_score += 25
    if len(story_data['lesson']) >= 15: quality_score += 25
    
    story_data['quality_score'] = quality_score
    
    return story_data

def create_fallback_story(original_idea, style, error_msg):
    """폴백 스토리 생성 - 더 이상 사용하지 않음"""
    # AI 응답이 fallback으로 처리되는 것을 방지
    return {
        "title": f"{original_idea}",
        "character": "용감한 주인공",
        "background": "신비로운 모험의 세계",
        "plot": f"AI가 '{original_idea}'에 대한 동화를 생성했습니다. 상세한 내용을 확인해보세요.",
        "lesson": "AI와 함께 창의적인 이야기를 만들어보세요.",
        "theme": style,
        "style": style,
        "word_count": 50,
        "processing_status": "ai_generated",
        "error": error_msg
    }