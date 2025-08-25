# python/test_basic.py (수정 버전)
import sys

print("🧪 기본 설정 테스트 시작...")

# 1. Python 라이브러리 확인
try:
    import ollama
    print("✅ Ollama 라이브러리 설치 확인")
except ImportError:
    print("❌ Ollama 라이브러리 없음 - pip install ollama")

try:
    import torch
    print("✅ PyTorch 설치 확인")
except ImportError:
    print("❌ PyTorch 없음 - pip install torch")

try:
    from diffusers import StableDiffusionPipeline
    print("✅ Diffusers 설치 확인")
except ImportError:
    print("❌ Diffusers 없음 - pip install diffusers")

# 2. Ollama 서비스 확인
try:
    client = ollama.Client()
    models = client.list()
    print(f"✅ Ollama 서비스 연결 성공, 모델 수: {len(models['models'])}")
    
    # 사용 가능한 모델 출력 (안전하게)
    for model in models['models']:
        try:
            model_name = model.get('name', 'Unknown')
            print(f"   - {model_name}")
        except Exception as e:
            print(f"   - 모델 정보 읽기 실패: {e}")
        
except Exception as e:
    print(f"❌ Ollama 서비스 연결 실패: {e}")
    print("   → Ollama가 실행 중인지 확인해주세요")

# 3. 실제 AI 호출 테스트 (간단하게)
print("\n🤖 실제 AI 호출 테스트...")
try:
    client = ollama.Client()
    
    # 간단한 테스트 메시지
    response = client.chat(
        model='gemma3',  # 또는 설치된 모델명
        messages=[
            {
                'role': 'user',
                'content': '안녕하세요! 한 줄로 인사해주세요.'
            }
        ]
    )
    
    ai_message = response['message']['content']
    print(f"✅ AI 응답 성공: {ai_message[:50]}...")
    
except Exception as e:
    print(f"❌ AI 호출 실패: {e}")
    print("💡 사용 가능한 모델명을 확인하거나 다른 모델을 시도해보세요")
    
    # 대체 모델들 시도
    alternative_models = ['llama2', 'mistral', 'codellama']
    print("   대체 모델 시도 중...")
    
    for alt_model in alternative_models:
        try:
            response = client.chat(
                model=alt_model,
                messages=[{'role': 'user', 'content': 'Hello'}]
            )
            print(f"✅ {alt_model} 모델 사용 가능!")
            break
        except:
            continue

print("\n🏁 테스트 완료!")