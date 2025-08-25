# python/controllers/simple_story.py (새로운 파일명으로!)
import sys
import json
import ollama

def create_story(idea, style="classic"):
    print(f"📚 AI로 '{idea}' 동화 만들기 시작...")
    
    try:
        # 프롬프트
        prompt = f"""아이디어: "{idea}"

이 아이디어로 짧은 동화를 만들어주세요.

JSON으로 답해주세요:
{{
    "title": "동화 제목",
    "character": "주인공",  
    "plot": "간단한 줄거리",
    "lesson": "교훈"
}}"""

        print("🤖 AI 생성 중...")
        
        # gemma3:latest 사용
        response = ollama.generate(
            model='gemma3:latest',
            prompt=prompt
        )
        
        ai_text = response['response']
        print(f"✅ AI 응답 받음 ({len(ai_text)}자)")
        
        # JSON 파싱 시도
        try:
            # JSON 부분 찾기
            start = ai_text.find('{')
            end = ai_text.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_part = ai_text[start:end]
                result = json.loads(json_part)
                result['success'] = True
                return result
            else:
                # JSON 못 찾으면 텍스트 그대로 활용
                return {
                    "title": f"{idea} 동화",
                    "character": "주인공",
                    "plot": ai_text,
                    "lesson": "좋은 교훈이 담겨있습니다",
                    "success": False,
                    "raw_text": ai_text
                }
                
        except json.JSONDecodeError:
            # JSON 파싱 실패해도 텍스트 활용
            return {
                "title": f"{idea} 동화", 
                "character": "주인공",
                "plot": ai_text,
                "lesson": "AI가 만든 특별한 이야기",
                "json_parse_failed": True,
                "raw_text": ai_text
            }
            
    except Exception as e:
        print(f"❌ 에러: {e}")
        return {
            "title": f"{idea} - 기본 동화",
            "character": "용감한 주인공", 
            "plot": f"{idea}에 대한 모험 이야기입니다.",
            "lesson": "노력하면 성공할 수 있습니다",
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python simple_story.py <아이디어>")
    else:
        idea = sys.argv[1]
        result = create_story(idea)
        print("\n" + "="*50)
        print("📖 생성된 동화:")
        print(json.dumps(result, ensure_ascii=False, indent=2))