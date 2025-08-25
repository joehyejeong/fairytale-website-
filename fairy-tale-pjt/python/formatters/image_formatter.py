# python/formatters/image_formatter.py
import os
import base64
from datetime import datetime
import logging

def format_image_result(page_number, korean_original, translation_data, 
                       image_data, style):
    """이미지 생성 결과 포맷팅"""
    try:
        # 이미지 메타데이터 추출
        image_metadata = extract_image_metadata(image_data)
        
        # 파일 경로 처리
        file_info = process_image_file(image_data, page_number)
        
        result = {
            "page_number": page_number,
            "korean_original": korean_original,
            "image_url": image_data.get('image_url', ''),
            "image_base64": image_data.get('image_base64', ''),
            "file_path": file_info.get('file_path', ''),
            "file_size": file_info.get('file_size', 0),
            "translation_data": {
                "final_prompt": translation_data.get('final_prompt', ''),
                "negative_prompt": translation_data.get('negative_prompt', ''),
                "quality_score": translation_data.get('quality_metrics', {}).get('quality_score', 0)
            },
            "image_metadata": image_metadata,
            "style": style,
            "generation_timestamp": datetime.now().isoformat(),
            "processing_status": "success"
        }
        
        logging.info(f"이미지 결과 포맷팅 완료: 페이지 {page_number}")
        return result
        
    except Exception as e:
        logging.error(f"이미지 포맷팅 실패: {e}")
        return create_fallback_image_result(page_number, korean_original, style, str(e))

def extract_image_metadata(image_data):
    """이미지 메타데이터 추출"""
    metadata = {
        "width": image_data.get('width', 512),
        "height": image_data.get('height', 384),
        "format": "PNG",
        "has_error": 'error' in image_data,
        "generation_prompt": image_data.get('prompt', ''),
        "negative_prompt": image_data.get('negative_prompt', ''),
        "seed": image_data.get('seed', None)
    }
    
    # 이미지 크기 계산 (base64에서)
    if 'image_base64' in image_data:
        try:
            # base64 데이터 크기 추정
            base64_size = len(image_data['image_base64'])
            estimated_size = (base64_size * 3) // 4  # base64 디코딩 후 크기
            metadata['estimated_file_size'] = estimated_size
        except:
            metadata['estimated_file_size'] = 0
    
    return metadata

def process_image_file(image_data, page_number):
    """이미지 파일 처리"""
    file_info = {
        "file_path": "",
        "file_size": 0,
        "file_exists": False
    }
    
    # 파일 경로가 있는 경우
    if 'filepath' in image_data:
        filepath = image_data['filepath']
        if os.path.exists(filepath):
            file_info['file_path'] = filepath
            file_info['file_size'] = os.path.getsize(filepath)
            file_info['file_exists'] = True
    
    # 파일이 없는 경우 새로 생성 시도
    if not file_info['file_exists'] and 'image_base64' in image_data:
        try:
            # temp 디렉토리 생성
            temp_dir = os.path.join(os.getcwd(), 'temp', 'images')
            os.makedirs(temp_dir, exist_ok=True)
            
            # 파일명 생성
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"page_{page_number}_{timestamp}.png"
            filepath = os.path.join(temp_dir, filename)
            
            # base64 디코딩 후 파일 저장
            image_bytes = base64.b64decode(image_data['image_base64'])
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            file_info['file_path'] = filepath
            file_info['file_size'] = len(image_bytes)
            file_info['file_exists'] = True
            
            logging.info(f"이미지 파일 저장: {filepath}")
            
        except Exception as e:
            logging.warning(f"이미지 파일 저장 실패: {e}")
    
    return file_info

def create_fallback_image_result(page_number, korean_original, style, error_msg):
    """폴백 이미지 결과 생성"""
    # 간단한 SVG placeholder 생성
    svg_placeholder = f'''<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="384" fill="#f0f0f0"/>
        <text x="256" y="180" text-anchor="middle" font-family="Arial" font-size="24" fill="#666">
            Page {page_number}
        </text>
        <text x="256" y="210" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">
            Image generation failed
        </text>
        <text x="256" y="240" text-anchor="middle" font-family="Arial" font-size="14" fill="#aaa">
            Placeholder image
        </text>
    </svg>'''
    
    svg_base64 = base64.b64encode(svg_placeholder.encode('utf-8')).decode('utf-8')
    
    return {
        "page_number": page_number,
        "korean_original": korean_original,
        "image_url": f"data:image/svg+xml;base64,{svg_base64}",
        "image_base64": svg_base64,
        "file_path": "",
        "file_size": len(svg_placeholder),
        "translation_data": {
            "final_prompt": "fallback placeholder image",
            "negative_prompt": "",
            "quality_score": 0
        },
        "image_metadata": {
            "width": 512,
            "height": 384,
            "format": "SVG",
            "has_error": True,
            "is_placeholder": True
        },
        "style": style,
        "error": error_msg,
        "processing_status": "fallback"
    }