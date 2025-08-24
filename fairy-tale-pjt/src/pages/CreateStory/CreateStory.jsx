import React, { useState } from 'react';
import StoryCard from '@/components/StoryCard';
import BasicButton from '@/components/BasicButton';
import { useNavigate } from 'react-router-dom';

const CreateStory = () => {
    const [selectedPlot, setSelectedPlot] = useState(1);
    const navigate = useNavigate();

    const handlePlotSelect = (plotNumber) => {
        setSelectedPlot(plotNumber);
    };

    const handleGenerateImage = () => {
        navigate('/create-image');
    };

    return (
        <div className="h-[calc(100vh-98px)] bg-white flex flex-col justify-center items-center">
            <div className="text-center max-w-full ">
                {/* 1. 메인 제목 */}
                <h1 className="text-3xl font-medium font-noto text-black mb-[14px] ">
                    줄거리를 토대로 이야기를 만들었어요.
                </h1>

                {/* 2. 서브 제목 */}
                <p className="text-base font-medium font-noto text-[#929292] mb-[20px]">
                    동화책 각 페이지에 들어갈 이야기를 수정할 수 있어요.
                </p>
                {/* 4-1. 줄거리 선택 원형 버튼들 */}
                <div className="w-full flex justify-center">
                    <div className="w-[calc(100vw/12)] flex justify-between mb-[20px]">
                        {[1, 2, 3].map((plotNumber) => (
                            <button
                                key={plotNumber}
                                onClick={() => handlePlotSelect(plotNumber)}
                                className={`w-[19px] h-[19px] rounded-full transition-colors duration-200 ${selectedPlot === plotNumber
                                    ? 'bg-custom-jk_yellow'
                                    : 'bg-white border border-custom-jk_yellow'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. 스토리 카드 가로 스크롤 영역 */}
                <div className="w-full mx-[13px]">
                    <div className="flex gap-[20px] overflow-x-auto pb-[20px] custom-scrollbar">
                        {[1, 2, 3, 4, 5, 6].map((pageNumber) => (
                            <StoryCard key={pageNumber} pageNumber={pageNumber} />
                        ))}
                    </div>
                </div>


                {/* 4-2. 동화책 만들기 버튼 */}
                <div className='w-full flex justify-end mr-[17px]'>
                    <BasicButton text="이 이야기로 동화책 만들기" onClick={handleGenerateImage} />
                </div>
            </div>
        </div>

    );
};

export default CreateStory;