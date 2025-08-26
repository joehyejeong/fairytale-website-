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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const topics = ['가족애', '우정', '권선징악', '환경보호', '직접작성'];

    const handleTopicChange = (value) => {
        setSelectedTopic(value);
    };

    const handleGeneratePlot = async () => {
        if (!storyContent.trim()) {
            setError('스토리 내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('AI 호출 시작:', { idea: storyContent, style: selectedTopic });

            // Electron API를 통해 AI 호출
            if (window.electronAPI && window.electronAPI.expandStory) {
                const result = await window.electronAPI.expandStory({
                    idea: storyContent,
                    style: selectedTopic
                });

                console.log('🎯 AI 응답 받음:', result);
                console.log('📝 AI 응답 타입:', typeof result);
                console.log('📝 AI 응답 길이:', Array.isArray(result) ? result.length : '배열 아님');

                console.log('✅ AI 응답 처리 완료');

                // AI 응답을 직접 CreatePlot 페이지로 전달
                navigate('/create-plot', {
                    state: {
                        aiResponse: result,
                        userInput: {
                            topic: selectedTopic,
                            content: storyContent
                        }
                    }
                });
            } else {
                console.error('Electron API를 찾을 수 없습니다.');
                setError('Electron API 연결 오류. 개발자 도구를 확인해주세요.');
            }
        } catch (error) {
            console.error('AI 호출 실패:', error);
            setError('줄거리 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-98px)] bg-white flex flex-col items-center justify-center">
            <div className="text-center max-w-5xl">
                {/* 1. 메인 제목 */}
                <h1 className="text-3xl font-medium font-noto text-black mb-[5px]">
                    떠오르는 스토리를 자유롭게 적어주세요
                </h1>

                {/* 2. 서브 제목 */}
                <p className="text-base font-medium font-noto text-[#929292] mb-[34px]">
                    직코 AI가 적은 내용을 토대로 줄거리를 만들어 드려요.
                </p>

                {/* 3. 주제 선택 영역 */}
                <div className="flex flex-row items-center mb-[17px]">
                    {/* 3-1. 주제 라벨 */}
                    <div className="w-[137px] h-[50px] bg-custom-jk_yellow text-white font-bold text-xl font-noto flex items-center justify-center px-[44px] py-[11px] rounded-[6px]">
                        주제
                    </div>

                    {/* 3-2. 주제 선택 드롭다운 */}
                    <div className="ml-[17px] w-[574px] h-[50px] bg-custom-jk_light_yellow flex items-center px-5 py-[11px] rounded-[6px] relative border border-custom-jk_dark_yellow">

                        <Select value={selectedTopic} onValueChange={handleTopicChange}>
                            <SelectTrigger className="w-full border-none bg-transparent text-xl font-normal font-noto text-black">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-custom-jk_light_yellow border border-custom-jk_dark_yellow rounded-[6px]">
                                {topics.map((topic) => (
                                    <SelectItem
                                        key={topic}
                                        value={topic}
                                        className="text-black hover:bg-custom-jk_dark_yellow focus:bg-custom-jk_dark_yellow rounded-[6px] transition-colors duration-200"
                                    >
                                        {topic}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* 4. 스토리 작성 영역 */}
                <div className="mb-[6px] relative">
                    <textarea
                        value={storyContent}
                        onChange={(e) => setStoryContent(e.target.value)}
                        placeholder="동화책의 내용을 작성해 주세요"
                        className="w-[727px] h-[200px] bg-custom-jk_light_yellow text-xl font-normal font-noto text-black placeholder:text-[#929292] px-[26px] pt-[12px] resize-none outline-none rounded-[6px] overflow-y-auto"
                        maxLength={300}
                        rows={5}
                    />
                    {/* 글자 수 표시 */}
                    <div className="absolute bottom-[28px] right-[28px] text-base font-normal font-noto text-[#929292]">
                        ({storyContent.length}/300)
                    </div>
                </div>

                {/* 5. 예시 텍스트 */}
                <div className="mb-[12px] text-left">
                    <p className="text-[13px] font-medium font-noto text-[#929292]">
                        예시1) 지훈이가 신비로운 우주행성을 탐험하며 친구들과 함께 행성의 보물을 찾아내는 이야기.
                    </p>
                    <p className="text-[13px] font-medium font-noto text-[#929292]">
                        예시2) 등장인물: 지훈이, 줄거리: 지훈이가 친구 별이와 함께 마법의 숲으로 놀러간다.
                    </p>
                    <p className="text-[13px] font-medium font-noto text-[#929292]">
                        예시3) 권선징악을 주제로 하고, 주인공 작은 다람쥐가 사악한 거대 용을 물리쳤으면 좋겠어.
                    </p>
                </div>

                {/* 6. 에러 메시지 */}
                {error && (
                    <div className="mb-4 text-red-500 font-medium">
                        {error}
                    </div>
                )}

                {/* 7. 줄거리 생성하기 버튼 */}
                <div className="flex justify-center">
                    <BasicButton
                        text={isLoading ? "줄거리를 생성하고 있습니다..." : "줄거리 생성하기"}
                        onClick={handleGeneratePlot}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default PrePlot;