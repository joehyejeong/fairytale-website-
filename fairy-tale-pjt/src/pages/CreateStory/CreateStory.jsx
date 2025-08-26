import React, { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import BasicButton from '@/components/BasicButton';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateStory = () => {
    const [selectedPlot, setSelectedPlot] = useState(1);
    const [bookData, setBookData] = useState(null);
    const [parsedPages, setParsedPages] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const { bookData: routeBookData } = location.state || {};
        if (routeBookData) {
            console.log('받은 bookData:', routeBookData);
            setBookData(routeBookData);

            // raw_response가 있으면 JSON 파싱
            if (routeBookData.raw_response) {
                try {
                    // JSON 문자열 정리 (제어 문자 제거)
                    let cleanResponse = routeBookData.raw_response
                        .replace(/\n/g, ' ')           // 줄바꿈 제거
                        .replace(/\r/g, ' ')           // 캐리지 리턴 제거
                        .replace(/\t/g, ' ')           // 탭 제거
                        .replace(/\f/g, ' ')           // 폼 피드 제거
                        .replace(/\v/g, ' ')           // 수직 탭 제거
                        .replace(/\b/g, ' ')           // 백스페이스 제거
                        .replace(/\0/g, ' ')           // 널 문자 제거
                        .replace(/\\/g, '\\\\')        // 백슬래시 이스케이프
                        .replace(/"/g, '\\"')          // 따옴표 이스케이프
                        .trim();

                    console.log('정리된 응답:', cleanResponse);

                    const parsed = JSON.parse(cleanResponse);
                    console.log('파싱된 AI 응답:', parsed);
                    setParsedPages(parsed.pages || []);
                } catch (e) {
                    console.error('JSON 파싱 실패:', e);
                    console.log('원본 raw_response:', routeBookData.raw_response);

                    // 파싱 실패 시 텍스트에서 페이지 정보 추출 시도
                    try {
                        const pages = extractPagesFromText(routeBookData.raw_response);
                        setParsedPages(pages);
                    } catch (extractError) {
                        console.error('페이지 추출도 실패:', extractError);
                        setParsedPages([]);
                    }
                }
            } else if (routeBookData.pages) {
                // 기존 pages 구조가 있으면 그대로 사용
                setParsedPages(routeBookData.pages);
            }
        }
    }, [location.state]);


    const handlePlotSelect = (plotNumber) => {
        setSelectedPlot(plotNumber);
    };

    const handleGenerateImage = () => {
        navigate('/create-image');
    };

    // 텍스트에서 페이지 정보 추출하는 함수
    const extractPagesFromText = (text) => {
        console.log('텍스트에서 페이지 추출 시도:', text.substring(0, 200));

        const pages = [];
        const pageRegex = /"page":\s*(\d+),\s*"content":\s*"([^"]+)"/g;
        let match;

        while ((match = pageRegex.exec(text)) !== null) {
            const pageNum = parseInt(match[1]);
            const content = match[2];

            pages.push({
                page: pageNum,
                content: content
            });

            console.log(`페이지 ${pageNum} 추출:`, content.substring(0, 50));
        }

        // 페이지 번호 순으로 정렬
        pages.sort((a, b) => a.page - b.page);

        console.log(`총 ${pages.length}개 페이지 추출 완료`);
        return pages;
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