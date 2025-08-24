import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicButton from '@/components/BasicButton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PrePlot = () => {

    const [storyContent, setStoryContent] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('권선징악');

    const navigate = useNavigate();

    const topics = ['가족애', '우정', '권선징악', '환경보호', '직접작성'];

    const handleTopicChange = (value) => {
        setSelectedTopic(value);
    };


    const handleGeneratePlot = () => {
        console.log('줄거리 생성하기 클릭됨');
        // CreateStory 페이지로 이동
        navigate('/create-story');
    };

    return (
        <div className="h-[calc(100vh-98px)] bg-white flex flex-col items-center justify-center">
            <div className="text-center max-w-4xl">
                {/* 1. 메인 제목 */}
                <h1 className="text-3xl font-medium font-noto text-black mb-[4px]">
                    떠오르는 스토리를 자유롭게 적어주세요
                </h1>

                {/* 2. 서브 제목 */}
                <p className="text-base font-medium font-noto text-[#929292] mb-[28px]">
                    직코 AI가 적은 내용을 토대로 줄거리를 만들어 드려요.
                </p>

                {/* 3. 주제 선택 영역 */}
                <div className="flex flex-row items-center mb-[14px]">
                    {/* 3-1. 주제 라벨 */}
                    <div className="w-[114px] h-[42px] bg-custom-jk_yellow text-white font-bold text-xl font-noto flex items-center justify-center px-[37px] py-[9px] rounded-[5px]">
                        주제
                    </div>

                    {/* 3-2. 주제 선택 드롭다운 */}
                    <div className="ml-[14px] w-[478px] h-[42px] bg-custom-jk_light_yellow flex items-center px-4 py-[9px] rounded-[5px] relative border border-custom-jk_dark_yellow">

                        <Select value={selectedTopic} onValueChange={handleTopicChange}>
                            <SelectTrigger className="w-full border-none bg-transparent text-xl font-normal font-noto text-black">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-custom-jk_light_yellow border border-custom-jk_dark_yellow rounded-[5px]">
                                {topics.map((topic) => (
                                    <SelectItem
                                        key={topic}
                                        value={topic}
                                        className="text-black hover:bg-custom-jk_dark_yellow focus:bg-custom-jk_dark_yellow rounded-[5px] transition-colors duration-200"
                                    >
                                        {topic}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* 4. 스토리 작성 영역 */}
                <div className="mb-[5px] relative">
                    <textarea
                        value={storyContent}
                        onChange={(e) => setStoryContent(e.target.value)}
                        placeholder="동화책의 내용을 작성해 주세요"
                        className="w-[606px] h-[calc(100vh/3)] bg-custom-jk_light_yellow text-xl font-normal font-noto text-black placeholder:text-[#929292] px-[22px] pt-[10px] resize-none outline-none rounded-[5px] overflow-y-auto"
                        maxLength={200}
                        rows={5}
                    />
                    {/* 글자 수 표시 */}
                    <div className="absolute bottom-[23px] right-[23px] text-base font-normal font-noto text-[#929292]">
                        ({storyContent.length}/200)
                    </div>
                </div>

                {/* 5. 예시 텍스트 */}
                <div className="mb-[10px] text-left">
                    <p className="text-[11px] font-medium font-noto text-[#929292]">
                        예시1) 지훈이가 신비로운 우주행성을 탐험하며 친구들과 함께 행성의 보물을 찾아내는 이야기.
                    </p>
                    <p className="text-[11px] font-medium font-noto text-[#929292]">
                        예시2) 등장인물: 지훈이, 줄거리: 지훈이가 친구 별이와 함께 마법의 숲으로 놀러간다.
                    </p>
                    <p className="text-[11px] font-medium font-noto text-[#929292]">
                        예시3) 권선징악을 주제로 하고, 주인공 작은 다람쥐가 사악한 거대 용을 물리쳤으면 좋겠어.
                    </p>
                </div>

                {/* 6. 줄거리 생성하기 버튼 */}
                <div className="flex justify-center">
                    <BasicButton text="줄거리 생성하기" onClick={handleGeneratePlot} />
                </div>
            </div>
        </div>
    );
};

export default PrePlot;