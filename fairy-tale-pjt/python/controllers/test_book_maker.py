# python/controllers/book_maker.py
import sys
import json
import ollama

def create_book_pages(story_data):
    """줄거리를 6페이지 동화책으로 변환"""
    print("📖 6페이지 동화책 생성 중...")
    
    try:
        title = story_data['title']
        plot = story_data['plot']
        
        prompt = f"""다음 줄거리를 정확히 6페이지의 동화책으로 만들어주세요.

제목: {title}
줄거리: {plot}

요구사항:
- 정확히 6페이지 구성
- 각 페이지는 2-3문장 (50-80자)
- 페이지별로 자연스러운 스토리 진행

JSON 형식으로 응답:
{{
    "pages": [
        {{"page": 1, "content": "첫 번째 페이지 내용"}},
        {{"page": 2, "content": "두 번째 페이지 내용"}},
        {{"page": 3, "content": "세 번째 페이지 내용"}},
        {{"page": 4, "content": "네 번째 페이지 내용"}},
        {{"page": 5, "content": "다섯 번째 페이지 내용"}},
        {{"page": 6, "content": "여섯 번째 페이지 내용"}}
    ],
    "title": "{title}"
}}"""

        print("🤖 AI로 동화책 페이지 생성 중...")
        
        response = ollama.generate(
            model='gemma3:latest',
            prompt=prompt
        )
        
        ai_response = response['response']
        print(f"✅ AI 응답 받음 ({len(ai_response)}자)")
        
        # JSON 파싱
        try:
            start = ai_response.find('{')
            end = ai_response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_part = ai_response[start:end]
                result = json.loads(json_part)
                
                # 6페이지 보장
                if 'pages' in result and len(result['pages']) == 6:
                    result['success'] = True
                    return result
                else:
                    print(f"⚠️ 페이지 수가 맞지 않음: {len(result.get('pages', []))}")
                    return create_fallback_book(story_data)
            else:
                print("⚠️ JSON을 찾을 수 없음")
                return create_fallback_book(story_data)
                
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON 파싱 실패: {e}")
            return create_fallback_book(story_data)
            
    except Exception as e:
        print(f"❌ 에러: {e}")
        return create_fallback_book(story_data)

def create_fallback_book(story_data):
    """폴백 6페이지 동화책"""
    title = story_data.get('title', '동화')
    character = story_data.get('character', '주인공').split(',')[0]  # 첫 번째 캐릭터만
    
    return {
        "pages": [
            {"page": 1, "content": f"옛날 옛날에 {character}이 살았습니다."},
            {"page": 2, "content": f"{character}은 특별한 도전을 시작했습니다."},
            {"page": 3, "content": "길을 가다가 여러 어려움을 만났습니다."},
            {"page": 4, "content": "하지만 포기하지 않고 계속 노력했습니다."},
            {"page": 5, "content": "드디어 목표를 달성할 수 있었습니다."},
            {"page": 6, "content": "그리고 모두가 행복하게 살았답니다."}
        ],
        "title": title,
        "fallback": True
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python book_maker.py '<story_json>'")
        print("예시: python book_maker.py '{\"title\":\"테스트\",\"plot\":\"테스트 내용\"}'")
    else:
        try:
            story_json = sys.argv[1]
            story_data = json.loads(story_json)
            
            result = create_book_pages(story_data)
            
            print("\n" + "="*60)
            print("📚 생성된 6페이지 동화책:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
        except json.JSONDecodeError:
            print("❌ JSON 형식이 올바르지 않습니다")