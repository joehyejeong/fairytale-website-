import React, { useState } from 'react';
import SmallIconButton from '../../components/SmallIconButton';
import Tooltip from '../../components/Tooltip';
import useStoryStore from '@/stores/storyStore';

const ImageContent1 = ({ onNext, currentPageIndex }) => {
    const [dropdownText, setDropdownText] = useState('수채화 일러스트');
    const [showTooltip, setShowTooltip] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // 스토어에서 함수들 가져오기
    const { getPageContent, getCurrentPageIndex } = useStoryStore();

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

    const handleBookIconClick = () => {
        // 현재 페이지의 내용을 텍스트 입력 영역에 자동으로 채워넣기
        const pageIndex = currentPageIndex || getCurrentPageIndex() || 1;

        // CreateImage의 페이지 인덱스를 실제 내용 페이지로 변환
        let contentPageNumber = 1;
        if (pageIndex === 0) {
            // 표지 페이지
            contentPageNumber = 1;
        } else if (pageIndex <= 6) {
            // 1-2페이지(index 1) -> page1, 3-4페이지(index 2) -> page2, ...
            contentPageNumber = pageIndex;
        } else {
            // 13페이지는 마지막 페이지
            contentPageNumber = 6;
        }

        const pageContent = getPageContent(contentPageNumber);

        if (pageContent) {
            // 페이지 내용을 이미지 생성 설명으로 변환
            const imageDescription = convertContentToImageDescription(pageContent);
            setDescription(imageDescription);
        } else {
            // 내용이 없으면 기본 메시지
            setDescription('현재 페이지에 내용이 없습니다. 직접 이미지 설명을 입력해주세요.');
        }
    };

    const convertContentToImageDescription = (content) => {
        // 동화책 내용을 이미지 생성 설명으로 변환하는 로직
        if (!content || content.trim() === '') return '';

        // 첫 번째 문장 또는 처음 100자 정도를 이미지 설명으로 사용
        const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
        const firstSentence = sentences[0]?.trim();

        if (firstSentence && firstSentence.length > 0) {
            // 이미지 생성에 적합하도록 설명 변환
            return `${firstSentence}을 표현한 동화 일러스트`;
        }

        // 첫 100자 사용
        const truncated = content.substring(0, 100);
        return truncated + (content.length > 100 ? '을 표현한 동화 일러스트' : '');
    };

    const handleGenerate = async () => {
        if (!description.trim()) {
            alert('이미지 설명을 입력해주세요.');
            return;
        }

        setIsGenerating(true);

        try {
            const pageNum = currentPageIndex || getCurrentPageIndex() || 1;

            console.log('이미지 생성 요청:', {
                description: description.trim(),
                style: dropdownText,
                pageNumber: pageNum
            });

            // Electron API를 통해 이미지 생성 요청
            const result = await window.electronAPI.generateImage({
                description: description.trim(),
                style: dropdownText,
                pageNumber: pageNum
            });

            console.log('이미지 생성 결과:', result);

            if (result.success) {
                // 선택된 스타일의 인덱스를 찾아서 다음 단계로 전달
                const selectedIndex = dropdownOptions.indexOf(dropdownText);
                onNext(selectedIndex, result);
            } else {
                console.error('이미지 생성 실패:', result.error);
                alert(`이미지 생성에 실패했습니다: ${result.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('이미지 생성 중 오류:', error);
            alert(`이미지 생성 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            {/* (1) AI 이미지 생성하기 제목 */}
            <div
                style={{
                    fontFamily: 'Noto Sans KR',
                    fontWeight: 500,
                    fontSize: '23px',
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
                    fontSize: '15px',
                    color: '#929292',
                    textAlign: 'center',
                    marginTop: '8px'
                }}
            >
                원하는 장면을 적어주세요. AI가 그림을 생성합니다.
            </div>

            {/* (3) 드롭다운 */}
            <div
                style={{
                    width: '554px',
                    height: '45px',
                    marginTop: '17px'
                }}
                className="bg-custom-jk_light_yellow rounded-[8px] flex justify-center items-center relative cursor-pointer"
                onClick={toggleDropdown}
            >
                <span
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '18px',
                        color: 'black'
                    }}
                >
                    {dropdownText}
                </span>

                {/* 드롭다운 화살표 */}
                <div style={{ marginLeft: '12px' }}>
                    <span className="material-symbols-outlined text-black" style={{ fontSize: '24px' }}>
                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </div>

                {/* 드롭다운 옵션들 */}
                {isDropdownOpen && (
                    <div
                        className="absolute top-full left-0 w-full bg-custom-jk_light_yellow border border-custom-jk_dark_yellow rounded-[8px] z-10"
                        style={{
                            maxHeight: '225px',
                            overflowY: 'auto',
                            marginTop: '2px'
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
                                    fontSize: '18px',
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
                    width: '554px',
                    height: '152px',
                    marginTop: '17px',
                    padding: '14px 78px 14px 24px'
                }}
                className="bg-custom-jk_lightest_yellow rounded-[8px] relative"
            >
                <textarea
                    placeholder="생성하고 싶은 이미지를 설명해주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isGenerating}
                    className="w-full h-full bg-transparent border-none outline-none resize-none"
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 400,
                        fontSize: '21px',
                        color: isGenerating ? '#999' : '#666'
                    }}
                />

                {/* Book2 아이콘 (Material Icons) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '14px',
                        right: '24px'
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
                                onClick={handleBookIconClick}
                                disabled={isGenerating}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* (5) 예시 문장들 */}
            <div
                style={{
                    marginTop: '9px',
                    textAlign: 'left',
                    width: '554px'
                }}
            >
                <div
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#929292',
                        lineHeight: '1.2'
                    }}
                >
                    예시1) 따뜻한 조명의 카페에서 책을 읽는 청년<br />
                    예시2) 마법사가 빛나는 지팡이로 주문을 외우고 있다
                </div>
            </div>

            {/* (6) 생성 버튼 */}
            <div style={{ marginTop: '32px' }}>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    style={{
                        width: '147px',
                        height: '42px',
                        backgroundColor: isGenerating ? '#ccc' : 'var(--jk-blue)',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '21px',
                        cursor: isGenerating || !description.trim() ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s',
                        opacity: isGenerating || !description.trim() ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!isGenerating && description.trim()) {
                            e.target.style.opacity = '0.8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isGenerating && description.trim()) {
                            e.target.style.opacity = '1';
                        }
                    }}
                >
                    {isGenerating ? '생성 중...' : '생성'}
                </button>
            </div>
        </div>
    );
};

export default ImageContent1;