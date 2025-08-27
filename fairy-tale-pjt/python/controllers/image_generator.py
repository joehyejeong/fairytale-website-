#!/usr/bin/env python3
# python/controllers/image_generator.py - 이미지 생성 컨트롤러

import sys
import json
import os
import shutil
from pathlib import Path

# Python 경로 설정
current_dir = Path(__file__).parent
python_dir = current_dir.parent
sys.path.insert(0, str(python_dir))


def main():
    try:
        # 인자 확인
        if len(sys.argv) < 4:
            result = {
                "error": "사용법: python image_generator.py <description> <style> <page_number>",
                "success": False
            }
            print(json.dumps(result, ensure_ascii=False))
            return

        korean_description = sys.argv[1]
        korean_style = sys.argv[2]
        page_number = int(sys.argv[3])

        print(
            f"이미지 생성 시작: {korean_description[:50]}... (페이지: {page_number})", file=sys.stderr)

        # 1. 번역 단계
        try:
            print("1단계: 텍스트 번역 중...", file=sys.stderr)
            from models.text_model import TextModel
            from prompts.translation_prompts import get_translation_prompt, get_style_translation_prompt

            text_model = TextModel()

            if text_model.available:
                # 설명 번역
                english_description = text_model.translate(
                    korean_description, "english")
                print(
                    f"설명 번역 완료: {english_description[:50]}...", file=sys.stderr)

                # 스타일 번역
                english_style = get_style_translation_prompt(korean_style)
                print(
                    f"스타일 번역: {korean_style} -> {english_style}", file=sys.stderr)
            else:
                # 폴백 번역
                english_description = translate_fallback(korean_description)
                english_style = translate_style_fallback(korean_style)
                print("번역 모델 사용 불가, 폴백 번역 사용", file=sys.stderr)

        except Exception as e:
            print(f"번역 단계 오류: {e}", file=sys.stderr)
            english_description = translate_fallback(korean_description)
            english_style = translate_style_fallback(korean_style)

        # 2. 이미지 생성 단계
        try:
            print("2단계: 이미지 생성 중...", file=sys.stderr)
            from models.image_model import ImageModel
            from prompts.image_prompts import get_image_generation_prompt

            # 프롬프트 생성
            prompt_data = get_image_generation_prompt(
                english_description, english_style)
            print(
                f"생성 프롬프트: {prompt_data['positive_prompt'][:100]}...", file=sys.stderr)

            # 이미지 생성 (이제 저장 경로는 모델에서 자동 처리)
            image_model = ImageModel()
            generation_result = image_model.generate_image(
                prompt_data,
                page_number,
                width=512,
                height=512
            )

            if generation_result["success"]:
                print(
                    f"이미지 생성 완료: {generation_result['image_path']}", file=sys.stderr)

                result = {
                    "success": True,
                    "image_path": generation_result["image_path"],
                    "page_number": page_number,
                    "original_description": korean_description,
                    "translated_description": english_description,
                    "style": korean_style,
                    "prompt_used": prompt_data["positive_prompt"],
                    "fallback": generation_result.get("fallback", False)
                }
            else:
                result = {
                    "success": False,
                    "error": generation_result.get("error", "이미지 생성 실패"),
                    "page_number": page_number
                }

        except Exception as e:
            print(f"이미지 생성 단계 오류: {e}", file=sys.stderr)
            result = {
                "success": False,
                "error": f"이미지 생성 중 오류: {str(e)}",
                "page_number": page_number
            }

        # 3. 결과 출력
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        # 최종 에러 처리
        print(f"시스템 에러: {e}", file=sys.stderr)
        error_result = {
            "success": False,
            "error": f"이미지 생성 시스템 오류: {str(e)}",
            "page_number": 0
        }
        print(json.dumps(error_result, ensure_ascii=False))


def translate_fallback(korean_text):
    """폴백 번역 함수"""

    # 간단한 키워드 번역 매핑
    translation_map = {
        "비가 오는": "raining",
        "학교": "school",
        "우산": "umbrella",
        "아이": "child",
        "집": "house",
        "공원": "park",
        "나무": "tree",
        "꽃": "flower",
        "고양이": "cat",
        "강아지": "dog",
        "햇빛": "sunlight",
        "구름": "cloud",
        "하늘": "sky",
        "바다": "ocean",
        "산": "mountain",
        "강": "river",
        "친구": "friend",
        "가족": "family",
        "엄마": "mother",
        "아빠": "father",
        "할머니": "grandmother",
        "할아버지": "grandfather"
    }

    result = korean_text
    for korean, english in translation_map.items():
        result = result.replace(korean, english)

    # 기본 동화책 스타일 추가
    return f"{result}, children's book illustration, colorful, friendly"


def translate_style_fallback(korean_style):
    """스타일 폴백 번역"""

    style_map = {
        "수채화 일러스트": "watercolor illustration",
        "캐주얼 드로잉": "casual drawing",
        "색연필 스타일": "colored pencil style",
        "3D 애니메이션": "3D animation",
        "빈티지 동화": "vintage fairy tale"
    }

    return style_map.get(korean_style, "watercolor illustration")


def move_image_to_saves(temp_path, page_number):
    """이미지를 saves 폴더로 이동"""
    try:
        current_dir = Path(__file__).parent
        saves_dir = current_dir.parent.parent / "src" / "assets" / "saves"
        saves_dir.mkdir(parents=True, exist_ok=True)

        image_filename = f"{str(page_number).zfill(2)}.png"
        save_path = saves_dir / image_filename

        # 파일 이동
        shutil.move(str(temp_path), str(save_path))

        print(f"이미지를 saves 폴더로 이동: {save_path}", file=sys.stderr)
        return str(save_path)

    except Exception as e:
        print(f"이미지 이동 실패: {e}", file=sys.stderr)
        return str(temp_path)


if __name__ == "__main__":
    main()
