# python/formatters/book_formatter.py
import json
import re
import logging

def format_book_pages(raw_response, story_data, style):
    """동화책 페이지 포맷팅"""
    try:
        # JSON 파싱 시도
        parsed_data = extract_json_from_response(raw_response)
        
        if parsed_data and 'pages' in parsed_data:
            pages = parsed_data['pages']
            # 페이지 검증 및 정리
            formatted_pages = validate_and_clean_pages(pages)
        else:
            # 텍스트에서 페이지 추출
            formatted_pages = extract_pages_from_text(raw_response)
        
        # 6페이지 보장
        formatted_pages = ensure_six_pages(formatted_pages, story_data)
        
        result = {
            "pages": formatted_pages,
            "title": story_data.get('title', '동화책'),
            "style": style,
            "total_pages": len(formatted_pages),
            "word_count": sum(len(page['content']) for page in formatted_pages),
            "processing_status": "success"
        }
        
        logging.info(f"동화책 포맷팅 완료: {len(formatted_pages)} 페이지")
        return result
        
    except Exception as e:
        logging.error(f"동화책 포맷팅 실패: {e}")
        return create_fallback_book(story_data, style, str(e))

def extract_json_from_response(raw_response):
    """JSON 추출 (story_formatter와 동일)"""
    try:
        return json.loads(raw_response.strip())
    except:
        pass
    
    try:
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', raw_response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
    except:
        pass
    
    try:
        brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', raw_response, re.DOTALL)
        if brace_match:
            return json.loads(brace_match.group(0))
    except:
        pass
    
    return None

def extract_pages_from_text(raw_text):
    """텍스트에서 페이지 추출"""
    pages = []
    lines = raw_text.split('\n')
    
    current_page = None
    current_content = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 페이지 번호 찾기
        page_match = re.search(r'페이지\s*(\d+)|page\s*(\d+)', line, re.IGNORECASE)
        if page_match:
            # 이전 페이지 저장
            if current_page is not None and current_content:
                pages.append({
                    "page": current_page,
                    "content": current_content.strip()
                })
            
            # 새 페이지 시작
            current_page = int(page_match.group(1) or page_match.group(2))
            current_content = ""
            
            # 같은 줄에 내용이 있으면 추가
            remaining = re.sub(r'페이지\s*\d+[:\-]?', '', line, flags=re.IGNORECASE)
            remaining = re.sub(r'page\s*\d+[:\-]?', '', remaining, flags=re.IGNORECASE)
            if remaining.strip():
                current_content = remaining.strip()
        else:
            # 내용 추가
            if current_page is not None:
                if current_content:
                    current_content += " " + line
                else:
                    current_content = line
    
    # 마지막 페이지 저장
    if current_page is not None and current_content:
        pages.append({
            "page": current_page,
            "content": current_content.strip()
        })
    
    return pages

def validate_and_clean_pages(pages):
    """페이지 검증 및 정리"""
    cleaned_pages = []
    
    for page_data in pages:
        if isinstance(page_data, dict) and 'page' in page_data and 'content' in page_data:
            content = page_data['content'].strip()
            
            # 내용 길이 검증 (너무 짧거나 길면 조정)
            if len(content) < 10:
                content += " 이야기가 계속됩니다."
            elif len(content) > 200:
                content = content[:197] + "..."
            
            cleaned_pages.append({
                "page": int(page_data['page']),
                "content": content
            })
    
    # 페이지 번호 순서대로 정렬
    cleaned_pages.sort(key=lambda x: x['page'])
    
    return cleaned_pages

def ensure_six_pages(pages, story_data):
   """6페이지 보장"""
   if len(pages) == 6:
       return pages
   
   title = story_data.get('title', '동화')
   character = story_data.get('character', '주인공')
   plot = story_data.get('plot', '흥미로운 이야기')
   
   if len(pages) < 6:
       # 페이지가 부족한 경우 추가
       template_pages = [
           f"옛날 옛날에 {character}이 살았습니다.",
           f"{character}은 특별한 모험을 시작했습니다.",
           "여러 어려움과 도전을 만나게 되었습니다.",
           "하지만 용기를 내어 문제를 해결해나갔습니다.",
           "마침내 모든 것을 극복할 수 있었습니다.",
           "그리고 모두가 행복하게 살았답니다."
       ]
       
       # 기존 페이지를 먼저 사용하고, 부족한 부분은 템플릿으로 채움
       result_pages = []
       for i in range(6):
           if i < len(pages):
               result_pages.append({
                   "page": i + 1,
                   "content": pages[i]['content']
               })
           else:
               result_pages.append({
                   "page": i + 1,
                   "content": template_pages[i]
               })
       
       return result_pages
   
   elif len(pages) > 6:
       # 페이지가 많은 경우 처음 6페이지만 사용
       return pages[:6]
   
   return pages

def create_fallback_book(story_data, style, error_msg):
   """폴백 동화책 생성"""
   title = story_data.get('title', '기본 동화')
   character = story_data.get('character', '주인공')
   
   fallback_pages = [
       {"page": 1, "content": f"옛날 옛날에 {character}이 살았습니다."},
       {"page": 2, "content": f"{character}은 새로운 모험을 시작했습니다."},
       {"page": 3, "content": "길을 가다가 여러 어려움을 만났습니다."},
       {"page": 4, "content": "하지만 포기하지 않고 계속 노력했습니다."},
       {"page": 5, "content": "드디어 모든 문제를 해결했습니다."},
       {"page": 6, "content": "그리고 모두가 행복하게 살았답니다."}
   ]
   
   return {
       "pages": fallback_pages,
       "title": title,
       "style": style,
       "total_pages": 6,
       "word_count": sum(len(page['content']) for page in fallback_pages),
       "processing_status": "fallback",
       "error": error_msg
   }