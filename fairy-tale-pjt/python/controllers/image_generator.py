# python/controllers/image_generator.py
import sys
import json
import logging
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from models.image_model import ImageModel
from controllers.translator import Translator
from prompts.image_prompts import get_image_prompt, get_negative_prompt
from formatters.image_formatter import format_image_result

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ImageGenerator:
    def __init__(self, text_model_name="gemma2", image_model_name="runwayml/stable-diffusion-v1-5"):
        """이미지 생성 컨트롤러"""
        try:
            self.translator = Translator(text_model_name)
            self.image_model = ImageModel(image_model_name)
            logging.info(f"ImageGenerator 초기화 완료")
        except Exception as e:
            logging.error(f"ImageGenerator 초기화 실패: {e}")
            raise
    
    def generate_image_from_korean(self, korean_page_content, page_number, style="classic"):
        """한국어 페이지 내용으로부터 이미지 생성"""
        try:
            logging.info(f"페이지 {page_number} 이미지 생성 시작: '{korean_page_content[:30]}...'")
            
            # Step 1: 한국어 → 영어 번역
            logging.info("1단계: 한국어 → 영어 번역")
            translation_result = self.translator.translate_for_image_generation(
                korean_page_content, 
                style
            )
            
            # Step 2: 이미지 프롬프트 최적화
            logging.info("2단계: 이미지 프롬프트 최적화")
            base_prompt = translation_result['final_prompt']
            optimized_prompt = get_image_prompt(base_prompt, page_number, style)
            
            # Step 3: 이미지 생성
            logging.info("3단계: AI 이미지 생성")
            negative_prompt = translation_result.get('negative_prompt', get_negative_prompt(style))
            
            image_result = self.image_model.generate(
                prompt=optimized_prompt,
                negative_prompt=negative_prompt,
                width=512,
                height=384,  # 4:3 비율
                num_inference_steps=25,
                guidance_scale=7.5
            )
            
            # Step 4: 결과 통합
            logging.info("4단계: 결과 정리")
            final_result = format_image_result(
                page_number=page_number,
                korean_original=korean_page_content,
                translation_data=translation_result,
                image_data=image_result,
                style=style
            )
            
            logging.info(f"✅ 페이지 {page_number} 이미지 생성 완료")
            return final_result
            
        except Exception as e:
            logging.error(f"이미지 생성 실패: {e}")
            return self._create_fallback_image(korean_page_content, page_number, style, str(e))
    
    def _create_fallback_image(self, korean_content, page_number, style, error_msg):
        """폴백 이미지 생성"""
        try:
            # 간단한 placeholder 이미지 생성
            from PIL import Image, ImageDraw, ImageFont
            import base64
            import io
            
            # 기본 이미지 생성
            img = Image.new('RGB', (512, 384), color='lightblue')
            draw = ImageDraw.Draw(img)
            
            # 텍스트 추가
            try:
                font = ImageFont.load_default()
            except:
                font = None
            
            text_lines = [
                f"Page {page_number}",
                "Image generation failed",
                "Placeholder image"
            ]
            
            y_offset = 150
            for line in text_lines:
                if font:
                    bbox = draw.textbbox((0, 0), line, font=font)
                    text_width = bbox[2] - bbox[0]
                else:
                    text_width = len(line) * 6
                
                x_position = (512 - text_width) // 2
                draw.text((x_position, y_offset), line, fill='white', font=font)
                y_offset += 30
            
            # base64 변환
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return {
                "page_number": page_number,
                "image_url": f"data:image/png;base64,{img_base64}",
                "korean_original": korean_content,
                "style": style,
                "error": error_msg,
                "fallback": True
            }
            
        except Exception as fallback_error:
            # 완전 폴백
            return {
                "page_number": page_number,
                "image_url": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjM4NCI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSIzODQiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=",
                "korean_original": korean_content,
                "style": style,
                "error": error_msg,
                "fallback_error": str(fallback_error),
                "fallback": True
            }

def main():
    try:
        if len(sys.argv) < 3:
            raise ValueError("사용법: python image_generator.py <korean_content> <page_number> [style]")
        
        korean_content = sys.argv[1]
        page_number = int(sys.argv[2])
        style = sys.argv[3] if len(sys.argv) > 3 else "classic"
        
        generator = ImageGenerator()
        result = generator.generate_image_from_korean(korean_content, page_number, style)
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        error_response = {
            "error": str(e),
            "page_number": int(sys.argv[2]) if len(sys.argv) > 2 else 1,
            "korean_original": sys.argv[1] if len(sys.argv) > 1 else "",
            "image_url": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjM4NCI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSIzODQiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=",
            "style": sys.argv[3] if len(sys.argv) > 3 else "classic",
            "fallback": True
        }
        print(json.dumps(error_response, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()