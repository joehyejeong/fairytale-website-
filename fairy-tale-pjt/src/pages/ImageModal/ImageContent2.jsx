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
    const { setAppliedImage } = useStoryStore();

    const styleOptions = [
        { id: 0, name: '수채화 일러스트', image: '/01.webp' },
        { id: 1, name: '캐주얼 드로잉', image: '/02.webp' },
        { id: 2, name: '색연필 스타일', image: '/03.webp' },
        { id: 3, name: '3D 애니메이션', image: '/04.webp' },
        { id: 4, name: '빈티지 동화', image: '/05.webp' }
    ];

    useEffect(() => {
        // 생성된 이미지 결과가 있으면 이미지 경로 설정
        if (generationResult && generationResult.success && generationResult.image_path) {
            setGeneratedImagePath(generationResult.image_path);
        }
    }, [generationResult]);

    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId);
        console.log('Selected style:', styleId);
    };

    const handleApply = async () => {
        if (!generationResult || !generationResult.success) {
            alert('적용할 이미지가 없습니다.');
            return;
        }

        setIsApplying(true);

        try {
            console.log('이미지 적용 요청:', {
                pageNumber: currentPageIndex
            });

            // Electron API를 통해 이미지 적용 요청 
            const result = await window.electronAPI.applyImage({
                pageNumber: currentPageIndex
            });

            console.log('이미지 적용 결과:', result);

            if (result.success) {
                // 스토어에 적용된 이미지 경로 저장
                setAppliedImage(currentPageIndex, result.imagePath);

                alert('이미지가 성공적으로 적용되었습니다!');

                // 적용이 성공하면 부모 컴포넌트에 알림
                if (onApply) {
                    onApply(result);
                }
            } else {
                console.error('이미지 적용 실패:', result.error);
                alert(`이미지 적용에 실패했습니다: ${result.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('이미지 적용 중 오류:', error);
            alert(`이미지 적용 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    const renderGeneratedImage = () => {
        if (generatedImagePath) {
            return (
                <img
                    src={`file://${generatedImagePath}`}
                    alt="Generated"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error('이미지 로드 실패:', generatedImagePath);
                        // 에러 시 기본 아이콘 표시
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallback = document.createElement('img');
                            fallback.src = sunIcon;
                            fallback.alt = 'Fallback';
                            fallback.className = 'fallback-icon';
                            fallback.style.width = '84px';
                            fallback.style.height = '84px';
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
                            disabled={isApplying || !generationResult || !generationResult.success}
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