# python/controllers/clean_translator.py
import sys
import json
import ollama
import re

def translate_and_clean(korean_text, page_number):
    """한국어 → 간결한 영어 이미지 프롬프트"""
    print(f"🌐 페이지 {page_number} 간결 번역 중...")
    
    try:
        prompt = f"""다음 한국어 동화 장면을 간단한 영어 이미지 프롬프트로 번역해주세요.

한국어: "{korean_text}"

요구사항:
- 한 줄로 간단하게
- 핵심 장면만 포함
- children's book illustration 스타일

간단한 영어 프롬프트로 답해주세요:"""

        response = ollama.generate(
            model='gemma3:latest', 
            prompt=prompt
        )
        
        raw_translation = response['response'].strip()
        
        # 첫 번째 문장만 추출 (가장 간단한 버전)
        first_line = raw_translation.split('\n')[0].strip()
        first_line = re.sub(r'^["\']|["\']$', '', first_line)  # 따옴표 제거
        
        # 동화책 키워드 추가
        clean_prompt = f"{first_line}, children's book illustration, cute bunny and turtle, colorful, soft style, high quality"
        
        print(f"✅ 간결 번역: {clean_prompt}")
        
        return {
            "page_number": page_number,
            "korean_original": korean_text,
            "english_prompt": clean_prompt,
            "negative_prompt": "ugly, blurry, scary, dark, low quality",
            "success": True
        }
        
    except Exception as e:
        print(f"❌ 번역 실패: {e}")
        return {
            "page_number": page_number,
            "korean_original": korean_text,
            "english_prompt": f"children's book illustration page {page_number}, cute bunny, colorful scene",
            "negative_prompt": "ugly, blurry, scary",
            "fallback": True
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("사용법: python clean_translator.py '<korean_text>' <page_number>")
    else:
        korean_text = sys.argv[1]
        page_number = int(sys.argv[2])
        
        result = translate_and_clean(korean_text, page_number)
        print("\n" + "="*50)
        print("🖼️ 간결한 이미지 프롬프트:")
        print(json.dumps(result, ensure_ascii=False, indent=2))