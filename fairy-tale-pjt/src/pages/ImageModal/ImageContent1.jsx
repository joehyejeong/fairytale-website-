import React, { useState } from 'react';
import SmallIconButton from '../../components/SmallIconButton';
import Tooltip from '../../components/Tooltip';

const ImageContent1 = ({ onNext }) => {
    const [dropdownText, setDropdownText] = useState('수채화 일러스트');
    const [showTooltip, setShowTooltip] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownOptions = [
        '수채화 일러스트',
        '캐주얼 드로잉',
        '색연필 스타일',
        '3D 애니메이션',
        '빈티지 동화'
    ];

    const handleDropdownChange = (option) => {
        setDropdownText(option);
        setIsDropdownOpen(false);
    };

    const handleBookIconHover = () => {
        setShowTooltip(true);
    };

    const handleBookIconLeave = () => {
        setShowTooltip(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleGenerate = () => {
        // 선택된 스타일의 인덱스를 찾아서 전달
        const selectedIndex = dropdownOptions.indexOf(dropdownText);
        onNext(selectedIndex);
    };

    return (
        <div className="flex flex-col justify-center items-center">
            {/* (1) AI 이미지 생성하기 제목 */}
            <div
                style={{
                    fontFamily: 'Noto Sans KR',
                    fontWeight: 500,
                    fontSize: '23px', // 15px * 1.5
                    color: 'black',
                    textAlign: 'center'
                }}
            >
                AI 이미지 생성하기
            </div>

            {/* (2) 설명 텍스트 */}
            <div
                style={{
                    fontFamily: 'Noto Sans KR',
                    fontWeight: 500,
                    fontSize: '15px', // 10px * 1.5
                    color: '#929292',
                    textAlign: 'center',
                    marginTop: '8px' // 5px * 1.5
                }}
            >
                원하는 장면을 적어주세요. AI가 그림을 생성합니다.
            </div>

            {/* (3) 드롭다운 */}
            <div
                style={{
                    width: '554px', // 369px * 1.5
                    height: '45px', // 30px * 1.5
                    marginTop: '17px' // 11px * 1.5
                }}
                className="bg-custom-jk_light_yellow rounded-[8px] flex justify-center items-center relative cursor-pointer"
                onClick={toggleDropdown}
            >
                <span
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '18px', // 12px * 1.5
                        color: 'black'
                    }}
                >
                    {dropdownText}
                </span>

                {/* 드롭다운 화살표 */}
                <div style={{ marginLeft: '12px' }}> {/* 8px * 1.5 */}
                    <span className="material-symbols-outlined text-black" style={{ fontSize: '24px' }}> {/* 16px * 1.5 */}
                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </div>

                {/* 드롭다운 옵션들 */}
                {isDropdownOpen && (
                    <div
                        className="absolute top-full left-0 w-full bg-custom-jk_light_yellow border border-custom-jk_dark_yellow rounded-[8px] z-10"
                        style={{
                            maxHeight: '225px', // 150px * 1.5
                            overflowY: 'auto',
                            marginTop: '2px' // 1px * 1.5
                        }}
                    >
                        {dropdownOptions.map((option, index) => (
                            <div
                                key={index}
                                className="px-5 py-3 hover:bg-custom-jk_dark_yellow cursor-pointer transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDropdownChange(option);
                                }}
                                style={{
                                    fontFamily: 'Noto Sans KR',
                                    fontWeight: 500,
                                    fontSize: '18px', // 12px * 1.5
                                    color: 'black',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* (4) 텍스트 입력 영역 */}
            <div
                style={{
                    width: '554px', // 369px * 1.5
                    height: '152px', // 101px * 1.5
                    marginTop: '17px', // 11px * 1.5
                    padding: '14px 78px 14px 24px' // 9px 52px 9px 16px * 1.5
                }}
                className="bg-custom-jk_lightest_yellow rounded-[8px] relative"
            >
                <textarea
                    placeholder="생성하고 싶은 이미지를 설명해주세요."
                    className="w-full h-full bg-transparent border-none outline-none resize-none"
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 400,
                        fontSize: '21px', // 14px * 1.5
                        color: '#666'
                    }}
                />

                {/* Book2 아이콘 (Material Icons) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '14px', // 9px * 1.5
                        right: '24px' // 16px * 1.5
                    }}
                >
                    <Tooltip
                        content="현재 페이지의 이야기를 확인할 수 있습니다."
                        show={showTooltip}
                    >
                        <div
                            onMouseEnter={handleBookIconHover}
                            onMouseLeave={handleBookIconLeave}
                        >
                            <SmallIconButton
                                icon={<span className="material-symbols-outlined text-custom-jk_yellow" style={{ fontSize: '29px', width: '29px', height: '29px' }}>book_2</span>}
                                onClick={() => { }}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* (5) 예시 문장들 */}
            <div
                style={{
                    marginTop: '9px', // 6px * 1.5
                    textAlign: 'left',
                    width: '554px' // 369px * 1.5
                }}
            >
                <div
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '12px', // 8px * 1.5
                        color: '#929292',
                        lineHeight: '1.2'
                    }}
                >
                    예시1) 따뜻한 조명의 카페에서 책을 읽는 청년<br />
                    예시2) 마법사가 빛나는 지팡이로 주문을 외우고 있다
                </div>
            </div>

            {/* (6) 생성 버튼 */}
            <div style={{ marginTop: '32px' }}> {/* 21px * 1.5 */}
                <button
                    onClick={handleGenerate}
                    style={{
                        width: '147px', // 98px * 1.5
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
                    생성
                </button>
            </div>
        </div>
    );
};

export default ImageContent1;
