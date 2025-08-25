import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import SmallIconButton from '../../components/SmallIconButton';
import Tooltip from '../../components/Tooltip';
import sunIcon from '../../assets/sun.svg';

const ImageContent2 = ({ onBack, selectedStyle: initialSelectedStyle = 0, onApply }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState(initialSelectedStyle);

    const styleOptions = [
        { id: 0, name: '수채화 일러스트', image: '/01.webp' },
        { id: 1, name: '캐주얼 드로잉', image: '/02.webp' },
        { id: 2, name: '색연필 스타일', image: '/03.webp' },
        { id: 3, name: '3D 애니메이션', image: '/04.webp' },
        { id: 4, name: '빈티지 동화', image: '/05.webp' }
    ];

    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId);
        console.log('Selected style:', styleId);
    };

    return (
        <div className="flex flex-col justify-center">
            {/* (1) 상단 헤더 */}
            <div className="flex flex-row items-center">
                {/* 왼쪽 화살표 아이콘 */}
                <div className="mr-[135px]">
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
                            />
                        </div>
                    </Tooltip>
                </div>

                {/* 텍스트 두 개 */}
                <div className="flex flex-col justify-center items-center">
                    <div
                        style={{
                            fontFamily: 'Noto Sans KR',
                            fontWeight: 500,
                            fontSize: '23px', // 15px * 1.5
                            color: 'black'
                        }}
                    >
                        AI 이미지 생성하기
                    </div>
                    <div
                        style={{
                            fontFamily: 'Noto Sans KR',
                            fontWeight: 500,
                            fontSize: '15px', // 10px * 1.5
                            color: '#929292',
                            marginTop: '8px' // 5px * 1.5
                        }}
                    >
                        이미지를 사용하시려면 적용하기 버튼을 눌러주세요.
                    </div>
                </div>
            </div>

            {/* (2) 하단 메인 콘텐츠 */}
            <div className="flex flex-row mt-[20px]"> {/* 13px * 1.5 */}
                {/* 왼쪽 이미지 영역 */}
                <div
                    style={{
                        width: '468px', // 312px * 1.5
                        height: '402px' // 268px * 1.5
                    }}
                    className="bg-custom-jk_lightest_yellow flex justify-center items-center"
                >
                    <img
                        src={sunIcon}
                        alt="Sun"
                        style={{
                            width: '84px', // 56px * 1.5
                            height: '84px' // 56px * 1.5
                        }}
                    />
                </div>

                {/* 오른쪽 스타일 선택 영역 */}
                <div
                    style={{
                        marginLeft: '27px' // 18px * 1.5
                    }}
                    className="flex flex-col"
                >
                    {/* (3-1) 스타일 옵션들 */}
                    <div
                        style={{
                            width: '203px', // 135px * 1.5
                            height: '345px' // 230px * 1.5
                        }}
                        className="bg-custom-jk_lightest_yellow flex flex-col justify-evenly "
                    >
                        {styleOptions.map((style, index) => (
                            <div
                                key={style.id}
                                className={`flex flex-row items-center cursor-pointer transition-colors`}
                                style={{
                                    width: '200px', // 133px * 1.5
                                    height: '68px', // 45px * 1.5
                                    padding: '12px', // 8px * 1.5
                                    backgroundColor: selectedStyle === style.id ? 'var(--jk-yellow)' : 'transparent',
                                    borderRadius: '4px'
                                }}
                                onClick={() => handleStyleSelect(style.id)}
                            >
                                {/* 번호 */}
                                <span
                                    style={{
                                        fontFamily: 'Noto Sans KR',
                                        fontWeight: 300,
                                        fontSize: '15px', // 10px * 1.5
                                        color: selectedStyle === style.id ? 'white' : 'black'
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                {/* 마진 */}
                                <div style={{ marginLeft: '9px' }} /> {/* 6px * 1.5 */}

                                {/* 이미지 */}
                                <img
                                    src={style.image}
                                    alt={style.name}
                                    style={{
                                        width: '38px', // 25px * 1.5
                                        height: '51px', // 34px * 1.5
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 기본 이미지 표시
                                        e.target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.style = {
                                            width: '38px', // 25px * 1.5
                                            height: '51px', // 34px * 1.5
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px', // 8px * 1.5
                                            color: '#999'
                                        };
                                        fallback.textContent = 'IMG';
                                        e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                                    }}
                                />

                                {/* 마진 */}
                                <div style={{ marginLeft: '9px' }} /> {/* 6px * 1.5 */}

                                {/* 텍스트 */}
                                <span
                                    style={{
                                        fontFamily: 'Noto Sans KR',
                                        fontWeight: 300,
                                        fontSize: '15px', // 10px * 1.5
                                        color: selectedStyle === style.id ? 'white' : 'black'
                                    }}
                                >
                                    {style.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* (3-2) 적용하기 버튼 */}
                    <div style={{ marginTop: '9px' }}> {/* 6px * 1.5 */}
                        <button
                            onClick={onApply}
                            style={{
                                width: '203px', // 135px * 1.5
                                height: '42px', // 28px * 1.5
                                backgroundColor: 'var(--jk-blue)',
                                borderRadius: '8px', // 5px * 1.5
                                border: 'none',
                                color: 'white',
                                fontFamily: 'Noto Sans KR',
                                fontWeight: 500,
                                fontSize: '21px', // 14px * 1.5
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            적용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageContent2;
