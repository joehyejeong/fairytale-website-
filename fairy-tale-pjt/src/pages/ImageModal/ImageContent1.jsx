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
    const { setAppliedImage } = useStoryStore();

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

    const handleGenerate = async () => {
        if (!description.trim()) {
            alert('이미지 설명을 입력해주세요.');
            return;
        }

        setIsGenerating(true);

        try {
            const pageNum = currentPageIndex;

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
                // ✅ 여기에서 스토어에 저장
                setAppliedImage(currentPageIndex, result.imagePath);

                // 선택된 스타일의 인덱스를 찾아서 다음 단계로 전달
                const selectedIndex = dropdownOptions.indexOf(dropdownText);
                onNext(selectedIndex, result);

                alert('이미지가 성공적으로 생성되었습니다!');
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
    }; // ✅ handleGenerate 함수 끝

    // ✅ 컴포넌트의 return (함수 밖에 있어야 함)
    return (
        <div className="flex flex-col justify-center items-center">
            {/* (1) AI 이미지 생성하기 제목 */}
            <div className="font-medium text-[23px] text-black text-center font-['Noto_Sans_KR']">
                AI 이미지 생성하기
            </div>

            {/* (2) 설명 텍스트 */}
            <div className="font-medium text-[15px] text-[#929292] text-center mt-2 font-['Noto_Sans_KR']">
                원하는 장면을 적어주세요. AI가 그림을 생성합니다.
            </div>

            {/* (3) 드롭다운 */}
            <div className="w-[554px] h-[45px] mt-[17px] bg-custom-jk_light_yellow rounded-[8px] flex justify-center items-center relative cursor-pointer" onClick={toggleDropdown}>
                <span className="font-medium text-[18px] text-black font-['Noto_Sans_KR']">
                    {dropdownText}
                </span>

                {/* 드롭다운 화살표 */}
                <div className="ml-3">
                    <span className="material-symbols-outlined text-black text-[24px]">
                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </div>

                {/* 드롭다운 옵션들 */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full bg-custom-jk_light_yellow border border-custom-jk_dark_yellow rounded-[8px] z-10 max-h-[225px] overflow-y-auto mt-0.5">
                        {dropdownOptions.map((option, index) => (
                            <div
                                key={index}
                                className="px-5 py-3 hover:bg-custom-jk_dark_yellow cursor-pointer transition-colors font-medium text-[18px] text-black whitespace-nowrap font-['Noto_Sans_KR']"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDropdownChange(option);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* (4) 텍스트 입력 영역 */}
            <div className="w-[554px] h-[152px] mt-[17px] px-6 py-[14px] pr-[78px] pl-6 bg-custom-jk_lightest_yellow rounded-[8px] relative">
                <textarea
                    placeholder="생성하고 싶은 이미지를 설명해주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isGenerating}
                    className="w-full h-full bg-transparent border-none outline-none resize-none font-normal text-[21px] font-['Noto_Sans_KR']"
                    style={{
                        color: isGenerating ? '#999' : '#666'
                    }}
                />

                {/* Book2 아이콘 (Material Icons) */}
                <div className="absolute top-[14px] right-6">
                    <Tooltip
                        content="현재 페이지의 이야기를 확인할 수 있습니다."
                        show={showTooltip}
                    >
                        <div
                            onMouseEnter={handleBookIconHover}
                            onMouseLeave={handleBookIconLeave}
                        >
                            <SmallIconButton
                                icon={<span className="material-symbols-outlined text-custom-jk_yellow text-[29px] w-[29px] h-[29px]">book_2</span>}
                                disabled={isGenerating}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* (5) 예시 문장들 */}
            <div className="mt-[9px] text-left w-[554px]">
                <div className="font-medium text-xs text-[#929292] leading-tight font-['Noto_Sans_KR']">
                    예시1) 따뜻한 조명의 카페에서 책을 읽는 청년<br />
                    예시2) 마법사가 빛나는 지팡이로 주문을 외우고 있다
                </div>
            </div>

            {/* (6) 생성 버튼 */}
            <div className="mt-8">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    className="w-[147px] h-[42px] bg-[var(--jk-blue)] disabled:bg-[#ccc] rounded-[8px] border-none text-white font-medium text-[21px] font-['Noto_Sans_KR'] disabled:cursor-not-allowed cursor-pointer transition-opacity duration-200 disabled:opacity-60 opacity-100 hover:opacity-80 disabled:hover:opacity-60"
                >
                    {isGenerating ? '생성 중...' : '생성'}
                </button>
            </div>
        </div>
    );
}; // ✅ ImageContent1 컴포넌트 함수 끝

export default ImageContent1;