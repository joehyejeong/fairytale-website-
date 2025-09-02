@echo off
echo USB 모델 복사 스크립트
echo ================================

set USB_DRIVE=E:

echo USB 드라이브: %USB_DRIVE%
echo 필요 용량: 약 8.2GB
echo.

echo USB 용량 확인 중...
for /f "tokens=3" %%i in ('dir %USB_DRIVE%\ ^| findstr "bytes free"') do set FREE_SPACE=%%i
echo USB 여유 공간 확인됨
echo.

echo USB 폴더 구조 생성 중...
mkdir %USB_DRIVE%\models 2>nul
mkdir %USB_DRIVE%\models\image-models 2>nul
mkdir %USB_DRIVE%\models\text-models 2>nul
mkdir %USB_DRIVE%\YourApp-Test 2>nul
echo 폴더 구조 생성 완료
echo.

echo HuggingFace 이미지 모델 복사 중... (5.11GB)
echo 시간이 오래 걸릴 수 있습니다...
xcopy /E /I /Y "D:\fairytale-pjt\fairytale-website-\fairy-tale-pjt\models_cache" %USB_DRIVE%\models\image-models\cache\
if errorlevel 1 (
    echo 이미지 모델 복사 실패
    pause
    exit /b 1
) else (
    echo 이미지 모델 복사 완료
)
echo.

echo Ollama 텍스트 모델 복사 중... (3.11GB)
xcopy /E /I /Y "C:\Users\eel8\.ollama\models" %USB_DRIVE%\models\text-models\ollama\
if errorlevel 1 (
    echo 텍스트 모델 복사 실패
    pause
    exit /b 1
) else (
    echo 텍스트 모델 복사 완료
)
echo.

echo 모든 모델 복사 완료!
pause