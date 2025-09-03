import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import SmallIconButton from '../../components/SmallIconButton';
import Tooltip from '../../components/Tooltip';
import sunIcon from '../../assets/sun.svg';
import useStoryStore from '@/stores/storyStore';

const ImageContent2 = ({ onBack, selectedStyle: initialSelectedStyle = 0, generationResult, currentPageIndex, onApply }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState(initialSelectedStyle);
    const [isApplying, setIsApplying] = useState(false);
    const [generatedImagePath, setGeneratedImagePath] = useState('');

    // 스토어에서 함수들 가져오기
    const { getAppliedImage, setAppliedImage } = useStoryStore();

    const styleOptions = [
        { id: 0, name: '수채화 일러스트', image: '/01.webp' },
        { id: 1, name: '캐주얼 드로잉', image: '/02.webp' },
        { id: 2, name: '색연필 스타일', image: '/03.webp' },
        { id: 3, name: '3D 애니메이션', image: '/04.webp' },
        { id: 4, name: '빈티지 동화', image: '/05.webp' }
    ];

    useEffect(() => {
        console.log('ImageContent2 - generationResult:', generationResult);
        console.log('ImageContent2 - currentPageIndex:', currentPageIndex);

        // 1. generationResult에서 이미지 경로 확인 (여러 가능한 경로명 확인)
        if (generationResult && generationResult.success) {
            const imagePath = generationResult.imagePath ||
                generationResult.image_path ||
                generationResult.path;

            if (imagePath) {
                console.log('이미지 경로 설정:', imagePath);
                setGeneratedImagePath(imagePath);
            }
        }

        // 2. 스토어에서 이미지 경로 확인 (백업)
        const storedImagePath = getAppliedImage(currentPageIndex);
        if (storedImagePath && !generatedImagePath) {
            console.log('스토어에서 이미지 경로 가져옴:', storedImagePath);
            setGeneratedImagePath(storedImagePath);
        }
    }, [generationResult, currentPageIndex, getAppliedImage, generatedImagePath]);

    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId);
        console.log('Selected style:', styleId);
    };

    const handleApply = async () => {
        console.log('이미지 적용 시작...');
        console.log('현재 상태:', { generationResult, generatedImagePath, currentPageIndex });

        if (!generationResult || !generationResult.success) {
            alert('적용할 이미지가 없습니다.');
            console.error('generationResult가 유효하지 않음:', generationResult);
            return;
        }

        // 이미지 경로 확인 (여러 가능성 체크)
        const imagePathToApply = generationResult.imagePath ||
            generationResult.image_path ||
            generationResult.path ||
            generatedImagePath;

        console.log('적용할 이미지 경로:', imagePathToApply);

        if (!imagePathToApply) {
            alert('이미지 경로를 찾을 수 없습니다.');
            console.error('이미지 경로 없음. generationResult:', generationResult);
            return;
        }

        setIsApplying(true);

        try {
            const applyData = {
                pageNumber: currentPageIndex,
                imagePath: imagePathToApply,
                selectedStyle: selectedStyle
            };

            console.log('이미지 적용 요청 데이터:', applyData);

            // Electron API를 통해 이미지 적용 요청 
            const result = await window.electronAPI.applyImage(applyData);

            console.log('이미지 적용 결과:', result);

            if (result.success) {
                // 스토어에 적용된 이미지 경로 저장
                const finalImagePath = result.imagePath || imagePathToApply;
                setAppliedImage(currentPageIndex, finalImagePath);

                alert('이미지가 성공적으로 적용되었습니다!');

                // 적용이 성공하면 부모 컴포넌트에 알림
                if (onApply) {
                    onApply({
                        ...result,
                        imagePath: finalImagePath
                    });
                }
            } else {
                console.error('이미지 적용 실패:', result);
                let errorMsg = result.error || '알 수 없는 오류';

                // 디버그 정보가 있으면 표시
                if (result.debug) {
                    console.log('디버그 정보:', result.debug);
                    errorMsg += `\n\n디버그 정보:\n- 제공된 경로: ${result.debug.imagePath}\n- 임시 경로: ${result.debug.tempPath}\n- 임시 폴더 존재: ${result.debug.tempsExists}\n- 임시 파일들: ${result.debug.tempFiles.join(', ')}`;
                }

                alert(`이미지 적용에 실패했습니다: ${errorMsg}`);
            }
        } catch (error) {
            console.error('이미지 적용 중 오류:', error);
            alert(`이미지 적용 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    const renderGeneratedImage = () => {
        console.log('이미지 렌더링 - generatedImagePath:', generatedImagePath);

        if (generatedImagePath) {
            // file:// 프로토콜이 없으면 추가
            const imageSrc = generatedImagePath.startsWith('file://')
                ? generatedImagePath
                : `file://${generatedImagePath}`;

            console.log('최종 이미지 소스:', imageSrc);

            return (
                <img
                    src={imageSrc}
                    alt="Generated"
                    className="w-full h-full object-cover"
                    onLoad={() => {
                        console.log('이미지 로드 성공:', imageSrc);
                    }}
                    onError={(e) => {
                        console.error('이미지 로드 실패:', imageSrc);
                        console.error('Error event:', e);

                        // 에러 시 기본 아이콘 표시
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallback = document.createElement('img');
                            fallback.src = sunIcon;
                            fallback.alt = 'Fallback';
                            fallback.className = 'fallback-icon';
                            fallback.style.cssText = `
                                width: 84px; 
                                height: 84px; 
                                object-fit: contain;
                            `;
                            parent.appendChild(fallback);
                        }
                    }}
                />
            );
        }

        // 생성된 이미지가 없으면 기본 아이콘 표시
        return (
            <img
                src={sunIcon}
                alt="Sun"
                className="w-[84px] h-[84px]"
            />
        );
    };

    // 디버깅을 위한 상태 출력
    console.log('ImageContent2 상태:', {
        generationResult,
        generatedImagePath,
        currentPageIndex,
        selectedStyle,
        isApplying
    });

    return (
        <div className="flex flex-col justify-center">
            {/* (1) 상단 헤더 - 올바른 순서로 배치 */}
            <div className="flex flex-row items-center justify-between w-full">
                {/* 왼쪽 화살표 아이콘 */}
                <div className="flex-shrink-0">
                    <Tooltip
                        content="이미지 생성 프롬프트를 수정할 수 있습니다."
                        show={showTooltip}
                    >
                        <div
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <SmallIconButton
                                icon={<ChevronLeft size={29} className="text-custom-jk_yellow" />}
                                onClick={onBack}
                                disabled={isApplying}
                            />
                        </div>
                    </Tooltip>
                </div>

                {/* 중앙 텍스트 - 올바른 위치 */}
                <div className="flex flex-col justify-center items-center flex-grow">
                    <div className="font-medium text-[23px] text-black font-['Noto_Sans_KR']">
                        AI 이미지 생성하기
                    </div>
                    <div className="font-medium text-[15px] text-[#929292] mt-2 font-['Noto_Sans_KR']">
                        {generationResult && generationResult.success
                            ? '이미지를 사용하시려면 적용하기 버튼을 눌러주세요.'
                            : '이미지 생성에 실패했습니다. 다시 시도해주세요.'
                        }
                    </div>
                </div>

                {/* 오른쪽 빈 공간 - 레이아웃 균형 */}
                <div className="flex-shrink-0 w-[44px]"></div>
            </div>

            {/* (2) 하단 메인 콘텐츠 */}
            <div className="flex flex-row justify-center mt-5">
                {/* 왼쪽 이미지 영역 */}
                <div className="w-[468px] h-[402px] bg-custom-jk_lightest_yellow flex justify-center items-center relative overflow-hidden">
                    {renderGeneratedImage()}

                    {/* 생성 실패했을 때 오버레이 */}
                    {generationResult && !generationResult.success && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="text-white text-center">
                                <div className="text-lg font-semibold">이미지 생성 실패</div>
                                <div className="text-sm mt-2">다시 시도해주세요</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 오른쪽 스타일 선택 영역 */}
                <div className="ml-[27px] flex flex-col">
                    {/* (3-1) 스타일 옵션들 */}
                    <div className="w-[203px] h-[345px] bg-custom-jk_lightest_yellow flex flex-col justify-evenly">
                        {styleOptions.map((style, index) => (
                            <div
                                key={style.id}
                                className="flex flex-row items-center cursor-pointer transition-colors w-[200px] h-[68px] p-3 rounded"
                                style={{
                                    backgroundColor: selectedStyle === style.id ? 'var(--jk-yellow)' : 'transparent',
                                    opacity: isApplying ? 0.6 : 1,
                                    pointerEvents: isApplying ? 'none' : 'auto'
                                }}
                                onClick={() => !isApplying && handleStyleSelect(style.id)}
                            >
                                {/* 번호 */}
                                <span className="font-light text-[15px] font-['Noto_Sans_KR']"
                                    style={{
                                        color: selectedStyle === style.id ? 'white' : 'black'
                                    }}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                {/* 마진 */}
                                <div className="ml-[9px]" />

                                {/* 이미지 */}
                                <img
                                    src={style.image}
                                    alt={style.name}
                                    className="w-[38px] h-[51px] object-cover"
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 기본 이미지 표시
                                        e.target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.style.cssText = `
                                            width: 38px; 
                                            height: 51px; 
                                            background-color: #f0f0f0; 
                                            display: flex; 
                                            align-items: center; 
                                            justify-content: center; 
                                            font-size: 12px; 
                                            color: #999;
                                        `;
                                        fallback.textContent = 'IMG';
                                        e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                                    }}
                                />

                                {/* 마진 */}
                                <div className="ml-[9px]" />

                                {/* 텍스트 */}
                                <span className="font-light text-[15px] font-['Noto_Sans_KR']"
                                    style={{
                                        color: selectedStyle === style.id ? 'white' : 'black'
                                    }}>
                                    {style.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* (3-2) 적용하기 버튼 */}
                    <div className="mt-[9px]">
                        <button
                            onClick={handleApply}
                            disabled={isApplying || !generationResult || !generationResult.success || !generatedImagePath}
                            className="w-[203px] h-[42px] bg-[var(--jk-blue)] disabled:bg-[#ccc] rounded-[8px] border-none text-white font-medium text-[21px] font-['Noto_Sans_KR'] disabled:cursor-not-allowed cursor-pointer transition-opacity duration-200 disabled:opacity-60 opacity-100 hover:opacity-80 disabled:hover:opacity-60"
                        >
                            {isApplying ? '적용 중...' : '적용하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageContent2;