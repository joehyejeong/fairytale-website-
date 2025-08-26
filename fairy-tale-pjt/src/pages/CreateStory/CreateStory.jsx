import React, { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import BasicButton from '@/components/BasicButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseBookData } from '@/lib/bookParser';
import useStoryStore from '@/stores/storyStore';

const CreateStory = () => {
    const [selectedPlot, setSelectedPlot] = useState(1);
    const [bookData, setBookData] = useState(null);
    const [parsedPages, setParsedPages] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { saveBookData } = useStoryStore();

    useEffect(() => {
        const { bookData: routeBookData } = location.state || {};
        if (routeBookData) {
            console.log('받은 bookData:', routeBookData);
            setBookData(routeBookData);

            // 유틸리티 함수를 사용하여 페이지 데이터 파싱
            const pages = parseBookData(routeBookData);
            setParsedPages(pages);
        }
    }, [location.state]);


    const handlePlotSelect = (plotNumber) => {
        setSelectedPlot(plotNumber);
    };

    const handleGenerateImage = () => {
        // Zustand store에 동화책 데이터 저장
        if (bookData && parsedPages.length > 0) {
            const title = bookData.title || '동화책';
            saveBookData(title, parsedPages);
            console.log('동화책 데이터 저장 완료:', title, parsedPages);
        }

        navigate('/create-image');
    };

    // extractPagesFromText 함수는 utils/bookParser.js로 이동

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

                {/* 3. 스토리 카드 가로 스크롤 영역 */}
                <div className="w-full mx-[13px]">
                    <div className="flex gap-[20px] overflow-x-auto pb-[20px] custom-scrollbar">
                        {[1, 2, 3, 4, 5, 6].map((pageNumber) => {
                            // parsedPages에서 해당 페이지 번호의 내용 찾기
                            const pageData = parsedPages.find(page => page.page === pageNumber);
                            const content = pageData?.content || '[ai 연결 안 됨]';

                            console.log(`페이지 ${pageNumber}:`, content);

                            return (
                                <StoryCard
                                    key={pageNumber}
                                    pageNumber={pageNumber}
                                    initialContent={content}
                                />
                            );
                        })}
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