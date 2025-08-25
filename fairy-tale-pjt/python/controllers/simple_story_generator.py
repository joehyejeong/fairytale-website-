#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 AI 스토리 생성기 - Ollama 사용
Windows 호환성을 위해 이모지 제거
"""

import sys
import json
import ollama

def create_three_stories(idea, style="classic"):
    """3개의 변형된 동화 생성"""
    print(f"AI로 '{idea}' 동화 3개 만들기 시작...")
    
    try:
        # 기본 프롬프트 - 매우 자세하고 전문적
        base_prompt = f"""당신은 한국의 유명한 동화 작가 '권정생' 선생님과 같은 따뜻하고 순수한 마음을 가진 동화 작가입니다. 어린이들에게 소중한 가치를 전달하는 아름다운 이야기를 만드는 전문가입니다.

다음 조건에 따라 동화의 구체적인 줄거리를 작성해주세요:

**필수 조건:**
1. 사용자가 제시한 짧은 줄거리를 바탕으로 구체적이고 상세한 줄거리 작성
2. 사용자가 제시한 주제가 자연스럽게 녹아든 내용
3. 기승전결 구조를 명확히 포함
4. 6페이지 분량(1200-1800자)의 동화로 발전 가능한 내용
5. 문제 상황 발생 → 해결 과정 → 교훈 전달의 흐름

**출력 형식:**
- 제목: [창의적이고 매력적인 제목]
- 등장인물: [주인공과 주요 등장인물 2-3명]
- 시공간 배경: [언제, 어디서 일어나는 이야기인지]
- 주제: [전달하고자 하는 교훈이나 가치]
- 줄거리: 
  * 기(시작): [상황 설정과 등장인물 소개]
  * 승(전개): [일상과 갈등의 발전]
  * 전(위기): [문제 상황의 절정]
  * 결(해결): [문제 해결과 교훈]

**어투 예시:**
"옛날 어느 작은 마을에 있었습니다. 그 마을에는 마음씨 착한 소녀가 살고 있었는데요. 소녀는 매일 아침 새들의 노랫소리를 들으며 하루를 시작했습니다."

사용자 입력: "{idea}" (주제: {style})

위 형식에 맞춰 JSON으로 답해주세요:
{{
    "title": "동화 제목",
    "character": "주인공과 주요 등장인물 상세 설명",
    "background": "시공간 배경과 환경에 대한 자세한 설명",
    "plot": "기승전결 구조를 포함한 상세한 줄거리 (800-1200자)",
    "lesson": "이야기에서 전달하고자 하는 핵심 교훈과 가치",
    "theme": "{style}",
    "story_structure": {{
        "introduction": "기(시작) - 상황 설정과 등장인물 소개",
        "development": "승(전개) - 갈등의 발전과 문제 상황",
        "climax": "전(위기) - 문제의 절정과 위기",
        "resolution": "결(해결) - 문제 해결과 교훈"
    }}
}}"""

        print("기본 동화 생성 중...")
        
        # 기본 동화 생성
        base_response = ollama.generate(
            model='gemma3:latest',
            prompt=base_prompt
        )
        
        base_story = parse_ai_response(base_response['response'], idea, "기본 동화")
        print(f"기본 동화 완성: {base_story['title']}")
        
        # 변형 1: 다른 관점에서의 이야기
        variation1_prompt = f"""당신은 한국의 유명한 동화 작가입니다. 다음 줄거리를 바탕으로 다른 관점에서의 변형된 이야기를 만들어주세요.

**원본 줄거리:** {idea}

**변형 요구사항:**
1. 주인공이 다른 선택을 한다면 어떻게 될까요?
2. 새로운 갈등이나 도전 요소 추가
3. 같은 주제({style})를 다르게 표현
4. 기승전결 구조 유지
5. 800-1200자 분량

**출력 형식:**
{{
    "title": "변형된 동화 제목",
    "character": "주인공과 등장인물 상세 설명",
    "background": "새로운 시공간 배경",
    "plot": "다른 관점의 상세한 줄거리",
    "lesson": "새로운 교훈과 가치",
    "theme": "{style}",
    "variation_type": "관점 변화",
    "story_structure": {{
        "introduction": "기(시작) - 새로운 상황 설정",
        "development": "승(전개) - 다른 갈등의 발전",
        "climax": "전(위기) - 새로운 위기 상황",
        "resolution": "결(해결) - 다른 해결 방법과 교훈"
    }}
}}"""

        print("변형 1 생성 중...")
        var1_response = ollama.generate(
            model='gemma3:latest',
            prompt=variation1_prompt
        )
        
        var1_story = parse_ai_response(var1_response['response'], idea, "변형 1")
        print(f"변형 1 완성: {var1_story['title']}")
        
        # 변형 2: 새로운 배경이나 상황
        variation2_prompt = f"""당신은 한국의 유명한 동화 작가입니다. 다음 줄거리를 바탕으로 배경이나 상황이 다른 변형된 이야기를 만들어주세요.

**원본 줄거리:** {idea}

**변형 요구사항:**
1. 시간, 장소, 환경이 달라진다면?
2. 새로운 모험과 도전 요소
3. 같은 주제({style})를 다른 배경에서 표현
4. 기승전결 구조 유지
5. 800-1200자 분량

**출력 형식:**
{{
    "title": "새로운 배경의 동화 제목",
    "character": "주인공과 등장인물 상세 설명",
    "background": "완전히 다른 시공간 배경",
    "plot": "새로운 배경의 상세한 줄거리",
    "lesson": "새로운 환경에서의 교훈과 가치",
    "theme": "{style}",
    "variation_type": "배경 변화",
    "story_structure": {{
        "introduction": "기(시작) - 새로운 배경 설정",
        "development": "승(전개) - 새로운 환경에서의 갈등",
        "climax": "전(위기) - 새로운 배경의 위기",
        "resolution": "결(해결) - 새로운 환경에서의 해결과 교훈"
    }}
}}"""

        print("변형 2 생성 중...")
        var2_response = ollama.generate(
            model='gemma3:latest',
            prompt=variation2_prompt
        )
        
        var2_story = parse_ai_response(var2_response['response'], idea, "변형 2")
        print(f"변형 2 완성: {var2_story['title']}")
        
        # 3개 스토리 결합
        stories = [base_story, var1_story, var2_story]
        
        # 각 스토리에 스타일과 상태 정보 추가
        for i, story in enumerate(stories):
            story['style'] = style
            story['processing_status'] = 'success'
            story['story_number'] = i + 1
        
        print("3개 동화 모두 완성!")
        return stories
        
    except Exception as e:
        print(f"에러: {e}")
        # 에러 시 폴백 스토리 생성
        return create_fallback_stories(idea, style, str(e))

def parse_ai_response(ai_text, idea, story_type):
    """AI 응답 파싱 - 더 강력한 파싱 로직"""
    print(f"AI 응답 파싱 시작: {story_type}")
    print(f"원본 응답: {ai_text[:200]}...")
    
    try:
        # 1. 직접 JSON 파싱 시도
        try:
            result = json.loads(ai_text.strip())
            print(f"직접 JSON 파싱 성공: {story_type}")
            return validate_and_fix_story(result, idea, story_type)
        except:
            pass
        
        # 2. JSON 코드 블록에서 추출
        try:
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', ai_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                print(f"코드 블록에서 JSON 추출 성공: {story_type}")
                return validate_and_fix_story(result, idea, story_type)
        except:
            pass
        
        # 3. 중괄호로 둘러싸인 부분 추출
        try:
            import re
            brace_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', ai_text, re.DOTALL)
            if brace_match:
                result = json.loads(brace_match.group(0))
                print(f"중괄호에서 JSON 추출 성공: {story_type}")
                return validate_and_fix_story(result, idea, story_type)
        except:
            pass
        
        # 4. 텍스트에서 정보 추출
        print(f"JSON 파싱 실패, 텍스트에서 정보 추출: {story_type}")
        return extract_from_text(ai_text, idea, story_type)
        
    except Exception as e:
        print(f"파싱 중 에러: {e}")
        return create_simple_story(idea, story_type, ai_text)

def validate_and_fix_story(story_data, idea, story_type):
    """스토리 데이터 검증 및 수정 - 새로운 구조 지원"""
    # 필수 필드 확인 및 기본값 설정
    if 'title' not in story_data or not story_data['title'] or story_data['title'].startswith(idea):
        # 제목이 없거나 기본값이면 더 구체적인 제목 생성
        if '우주' in idea or '행성' in idea:
            story_data['title'] = "우주 탐험대의 모험"
        elif '마법' in idea or '요정' in idea:
            story_data['title'] = "마법의 세계로"
        elif '동물' in idea or '친구' in idea:
            story_data['title'] = "특별한 친구들"
        else:
            story_data['title'] = "신비로운 모험"
    
    if 'character' not in story_data or not story_data['character']:
        story_data['character'] = "용감한 주인공과 친구들"
    
    if 'background' not in story_data or not story_data['background'] or 'AI가 생성한 배경 설정' in str(story_data['background']):
        # 배경이 없거나 기본값이면 구체적인 배경 생성
        if '우주' in idea or '행성' in idea:
            story_data['background'] = "미지의 우주 공간, 신비로운 외계 행성"
        elif '마법' in idea or '요정' in idea:
            story_data['background'] = "마법이 깃든 신비로운 숲속 왕국"
        elif '동물' in idea or '친구' in idea:
            story_data['background'] = "자연이 살아 숨쉬는 아름다운 마을"
        else:
            story_data['background'] = "꿈과 모험이 가득한 신비로운 세계"
    
    if 'plot' not in story_data or not story_data['plot'] or len(story_data['plot']) < 100:
        # 줄거리가 없거나 너무 짧으면 기본 줄거리 생성
        if '우주' in idea or '행성' in idea:
            story_data['plot'] = """【기(시작)】지훈이는 우주 탐험대의 대장이 되어 친구들과 함께 미지의 행성으로 떠납니다. 그들은 우주선을 타고 별들 사이를 날아갑니다.

【승(전개)】행성에 도착한 탐험대는 신비로운 생물들과 만나고, 위험한 지형을 통과해야 합니다. 함께 협력하며 어려움을 극복해 나갑니다.

【전(위기)】보물을 찾는 과정에서 거대한 우주 괴물과 마주칩니다. 모든 것이 절망적으로 보이지만, 지훈이와 친구들은 포기하지 않습니다.

【결(해결)】지혜와 용기, 그리고 우정의 힘으로 괴물을 물리치고 보물을 찾아냅니다. 이 모험을 통해 진정한 친구의 소중함을 깨닫게 됩니다."""
        else:
            story_data['plot'] = f"【기(시작)】{idea}의 시작입니다. 주인공은 새로운 모험을 시작합니다.\n\n【승(전개)】모험을 통해 여러 도전과 어려움을 겪게 됩니다.\n\n【전(위기)】가장 어려운 순간이 찾아오지만, 주인공은 포기하지 않습니다.\n\n【결(해결)】노력과 용기로 모든 문제를 해결하고 소중한 교훈을 얻습니다."
    
    if 'lesson' not in story_data or not story_data['lesson']:
        story_data['lesson'] = "용기와 우정의 중요성"
    
    if 'theme' not in story_data:
        story_data['theme'] = "adventure"
    
    # story_structure가 있으면 plot을 더 풍부하게 만들기
    if 'story_structure' in story_data and story_data['story_structure']:
        structure = story_data['story_structure']
        enhanced_plot = ""
        
        if 'introduction' in structure:
            enhanced_plot += f"【기(시작)】{structure['introduction']}\n\n"
        if 'development' in structure:
            enhanced_plot += f"【승(전개)】{structure['development']}\n\n"
        if 'climax' in structure:
            enhanced_plot += f"【전(위기)】{structure['climax']}\n\n"
        if 'resolution' in structure:
            enhanced_plot += f"【결(해결)】{structure['resolution']}"
        
        if enhanced_plot.strip():
            story_data['plot'] = enhanced_plot.strip()
    
    return story_data

def extract_from_text(text, idea, story_type):
    """텍스트에서 스토리 정보 추출 - 새로운 구조 지원"""
    lines = text.split('\n')
    
    title = ""
    character = ""
    background = ""
    plot = ""
    lesson = ""
    theme = ""
    
    current_section = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 섹션 식별
        if '제목' in line or 'title' in line.lower():
            current_section = "title"
            title = extract_value_from_line(line)
        elif '등장인물' in line or 'character' in line.lower():
            current_section = "character"  
            character = extract_value_from_line(line)
        elif '배경' in line or 'background' in line.lower():
            current_section = "background"
            background = extract_value_from_line(line)
        elif '줄거리' in line or 'plot' in line.lower():
            current_section = "plot"
            plot = extract_value_from_line(line)
        elif '교훈' in line or 'lesson' in line.lower():
            current_section = "lesson"
            lesson = extract_value_from_line(line)
        elif '주제' in line or 'theme' in line.lower():
            current_section = "theme"
            theme = extract_value_from_line(line)
        else:
            # 현재 섹션에 내용 추가
            if current_section == "plot" and len(line) > 10:
                plot += " " + line
            elif current_section == "lesson" and len(line) > 5:
                lesson += " " + line
            elif current_section == "background" and len(line) > 5:
                background += " " + line
    
    return {
        "title": title or f"{idea} - {story_type}",
        "character": character or "용감한 주인공",
        "background": background or "마법의 숲과 같은 신비로운 장소",
        "plot": plot or f"{idea}에 대한 {story_type}입니다.",
        "lesson": lesson or "좋은 교훈이 담겨있습니다",
        "theme": theme or "우정"
    }

def create_simple_story(idea, story_type, ai_text):
    """간단한 스토리 생성 (파싱 실패 시) - 새로운 구조 지원"""
    return {
        "title": f"{idea} - {story_type}",
        "character": "용감한 주인공",
        "background": "마법의 숲과 같은 신비로운 장소",
        "plot": ai_text if ai_text.strip() else f"{idea}에 대한 {story_type}입니다.",
        "lesson": "AI가 만든 특별한 이야기",
        "theme": "우정"
    }

def create_fallback_stories(idea, style, error_msg):
    """폴백 스토리 생성 (AI 실패 시)"""
    print(f"폴백 스토리 생성: {error_msg}")
    
    base_plot = f"{idea}를 주제로 한 흥미진진한 모험 이야기입니다. 주인공은 여러 어려움을 극복하며 성장하게 됩니다."
    
    return [
        {
            "title": f"{idea} - 기본 동화",
            "character": "용감한 주인공",
            "plot": base_plot,
            "lesson": "포기하지 않고 노력하면 반드시 좋은 결과가 있다는 교훈을 줍니다.",
            "style": style,
            "processing_status": "fallback",
            "error": error_msg,
            "story_number": 1
        },
        {
            "title": f"{idea} - 변형 1",
            "character": "지혜로운 주인공",
            "plot": f"{base_plot} 이번에는 주인공이 다른 방법으로 문제를 해결합니다. 협력과 지혜의 중요성을 배우게 됩니다.",
            "lesson": "혼자서는 어려운 일도 함께하면 해결할 수 있습니다.",
            "style": style,
            "processing_status": "fallback",
            "story_number": 2
        },
        {
            "title": f"{idea} - 변형 2",
            "character": "호기심 많은 주인공",
            "plot": f"{base_plot} 새로운 환경에서 주인공은 예상치 못한 모험을 경험하게 됩니다. 호기심과 용기가 새로운 기회를 만들어냅니다.",
            "lesson": "호기심을 가지고 새로운 것에 도전하는 것이 중요합니다.",
            "style": style,
            "processing_status": "fallback",
            "story_number": 3
        }
    ]

def main():
    """메인 실행 함수"""
    try:
        if len(sys.argv) < 2:
            raise ValueError("사용법: python simple_story_generator.py <아이디어> [스타일]")
        
        idea = sys.argv[1]
        style = sys.argv[2] if len(sys.argv) > 2 else "classic"
        
        print(f"스토리 생성 시작: '{idea}' ({style})")
        print("=" * 50)
        
        # 1개 동화만 생성 (프롬프트는 그대로)
        result = create_single_story(idea, style)
        
        print("\n" + "=" * 50)
        print("생성된 동화:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        # 에러 발생 시 JSON 형식으로 에러 정보 출력
        error_response = [
            {
                "error": str(e),
                "title": "오류 발생",
                "character": "알 수 없음",
                "plot": f"줄거리 생성 중 오류가 발생했습니다: {str(e)}",
                "lesson": "때로는 예상치 못한 일이 일어날 수 있습니다",
                "style": sys.argv[2] if len(sys.argv) > 2 else "classic",
                "processing_status": "error",
                "story_number": 1
            }
        ]
        print(json.dumps(error_response, ensure_ascii=False, indent=2))
        sys.exit(1)

def create_single_story(idea, style="classic"):
    """1개의 자세한 동화만 생성"""
    print(f"AI로 '{idea}' 동화 1개 만들기 시작...")
    
    try:
        # 기본 프롬프트
        base_prompt = f"""당신은 한국의 유명한 동화 작가 '권정생' 선생님과 같은 따뜻하고 순수한 마음을 가진 동화 작가입니다. 어린이들에게 소중한 가치를 전달하는 아름다운 이야기를 만드는 전문가입니다.

다음 조건에 따라 동화의 구체적인 줄거리를 작성해주세요:

**필수 조건:**
1. 사용자가 제시한 짧은 줄거리를 바탕으로 구체적이고 상세한 줄거리 작성
2. 사용자가 제시한 주제가 자연스럽게 녹아든 내용
3. 기승전결 구조를 명확히 포함
4. 6페이지 분량(1200-1800자)의 동화로 발전 가능한 내용
5. 문제 상황 발생 → 해결 과정 → 교훈 전달의 흐름

**출력 형식:**
- 제목: [1-10글자 내의 창의적이고 매력적인 제목] (예: "우주 탐험대", "마법의 열쇠")
- 등장인물: [주인공과 주요 등장인물 2-3명]
- 시공간 배경: [구체적인 시간과 장소] (예: "2025년 미지의 우주 공간", "마법이 깃든 숲속 왕국")
- 주제: [전달하고자 하는 교훈이나 가치]
- 줄거리: 
  * 기(시작): [상황 설정과 등장인물 소개]
  * 승(전개): [일상과 갈등의 발전]
  * 전(위기): [문제 상황의 절정]
  * 결(해결): [문제 해결과 교훈]

**어투 예시:**
"옛날 어느 작은 마을에 있었습니다. 그 마을에는 마음씨 착한 소녀가 살고 있었는데요. 소녀는 매일 아침 새들의 노랫소리를 들으며 하루를 시작했습니다."

사용자 입력: "{idea}" (주제: {style})

위 형식에 맞춰 JSON으로 답해주세요:
{{
    "title": "동화 제목 (1-10글자)",
    "character": "주인공과 주요 등장인물 상세 설명",
    "background": "구체적인 시공간 배경",
    "plot": "기승전결 구조를 포함한 상세한 줄거리 (300자 이상)",
    "lesson": "이야기에서 전달하고자 하는 핵심 교훈과 가치",
    "theme": "{style}",
    "story_structure": {{
        "introduction": "기(시작) - 상황 설정과 등장인물 소개",
        "development": "승(전개) - 갈등의 발전과 문제 상황",
        "climax": "전(위기) - 문제의 절정과 위기",
        "resolution": "결(해결) - 문제 해결과 교훈"
    }}
}}"""

        print("자세한 동화 생성 중...")
        
        # 1개의 자세한 동화만 생성
        base_response = ollama.generate(
            model='gemma3:4b',
            prompt=base_prompt
        )
        
        base_story = parse_ai_response(base_response['response'], idea, "메인 동화")
        print(f"동화 완성: {base_story['title']}")
        
        # 1개 스토리만 반환
        stories = [base_story]
        
        # 스토리에 스타일과 상태 정보 추가
        for i, story in enumerate(stories):
            story['style'] = style
            story['processing_status'] = 'success'
            story['story_number'] = i + 1
        
        print("동화 완성!")
        return stories
        
    except Exception as e:
        print(f"에러: {e}")
        # 에러 시 폴백 스토리 생성
        return create_fallback_stories(idea, style, str(e))

if __name__ == "__main__":
    main()
