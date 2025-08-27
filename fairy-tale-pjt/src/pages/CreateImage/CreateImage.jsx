import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PdfButton from '../../components/PdfButton';
import LeftPage from './LeftPage';
import RightPage from './RightPage';
import TitlePage from './TitlePage';
import ImageModal from '../ImageModal/ImageModal';
import useStoryStore from '@/stores/storyStore';

const CreateImage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState('');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [clickedPageSide, setClickedPageSide] = useState(null); // 'left' or 'right'

    // 스토어에서 함수들 가져오기
    const {
        getTitle,
        getName,
        setCurrentPageIndex,
        getAppliedImage,
        setAppliedImage
    } = useStoryStore();

    const title = getTitle();
    const userName = getName();

    const pages = [
        { type: 'cover', title: '표지' },
        { type: 'content', title: '1-2페이지' },
        { type: 'content', title: '3-4페이지' },
        { type: 'content', title: '5-6페이지' },
        { type: 'content', title: '7-8페이지' },
        { type: 'content', title: '9-10페이지' },
        { type: 'content', title: '11-12페이지' },
        { type: 'content', title: '13페이지' }
    ];

    // 페이지가 변경될 때마다 스토어의 currentPageIndex 업데이트
    useEffect(() => {
        setCurrentPageIndex(currentPage);
    }, [currentPage, setCurrentPageIndex]);

    // 컴포넌트 마운트 시 기존 이미지들 로드
    useEffect(() => {
        loadExistingImages();
    }, []);

    const loadExistingImages = async () => {
        // saves 폴더에서 기존 이미지들을 확인
        // 실제 구현에서는 파일 시스템 접근이 필요하므로 기본 구조만 제공
        try {
            console.log('기존 이미지 로드 확인 중...');
            // 여기서는 예시로 빈 로직으로 남겨둡니다
            // 실제로는 electron API를 통해 saves 폴더의 파일들을 확인해야 합니다
        } catch (error) {
            console.error('기존 이미지 로드 실패:', error);
        }
    };

    // 페이지 인덱스를 실제 페이지 번호로 변환
    const getPageNumberFromIndex = (pageIndex, side) => {
        if (pageIndex === 0) {
            // 표지 페이지
            return side === 'left' ? 0 : 1;
        } else if (pageIndex === 7) {
            // 마지막 페이지 (13페이지) - 왼쪽만 사용
            return side === 'left' ? 13 : null;
        } else {
            // 일반 페이지들
            const basePageNumber = (pageIndex - 1) * 2 + 1;
            return side === 'left' ? basePageNumber : basePageNumber + 1;
        }
    };

    // 페이지별 이미지 경로 가져오기
    const getImageForPage = (pageNumber) => {
        if (pageNumber === null) return null;
        const imagePath = getAppliedImage(pageNumber);
        console.log(`getImageForPage - 페이지 ${pageNumber}:`, imagePath);
        if (imagePath && imagePath !== 'null') {
            // 파일명 형식 확인
            const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
            console.log(`getImageForPage - 파일명:`, fileName);

            // temps 폴더의 이미지는 @/assets/temps 경로로 접근
            if (imagePath.includes('temps')) {
                return `@/assets/temps/${fileName}`;
            } else {
                return `file://${imagePath}`;
            }
        }
        return null;
    };

    const handlePrevPage = () => {
        if (isFlipping || currentPage === 0) return;

        setIsFlipping(true);
        setFlipDirection('left');

        setTimeout(() => {
            setCurrentPage(prev => Math.max(0, prev - 1));
            setIsFlipping(false);
            setFlipDirection('');
        }, 1000);
    };

    const handleNextPage = () => {
        if (isFlipping || currentPage === pages.length - 1) return;

        setIsFlipping(true);
        setFlipDirection('right');

        setTimeout(() => {
            setCurrentPage(prev => Math.min(pages.length - 1, prev + 1));
            setIsFlipping(false);
            setFlipDirection('');
        }, 1000);
    };

    const handlePdfExport = () => {
        console.log('PDF 내보내기');
        // PDF 내보내기 로직 구현
    };

    const handleImageClick = (side) => {
        console.log(`이미지 클릭: ${side} side, page ${currentPage}`);
        setClickedPageSide(side);
        setIsImageModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsImageModalOpen(false);
        setClickedPageSide(null);
    };

    const handleImageApplied = (applyResult) => {
        // 이미지 적용 후 상태 업데이트
        if (applyResult && applyResult.success) {
            const pageNumber = applyResult.pageNumber;
            setAppliedImage(pageNumber, applyResult.imagePath);

            console.log(`페이지 ${pageNumber}에 이미지 적용됨:`, applyResult.imagePath);

            // 강제 리렌더링을 위한 상태 업데이트
            setCurrentPage(prev => prev);
        }
    };

    const getCurrentPageIndex = () => {
        if (clickedPageSide) {
            return getPageNumberFromIndex(currentPage, clickedPageSide);
        }
        return currentPage;
    };

    const renderBook = () => {
        const currentPageData = pages[currentPage];

        if (currentPageData.type === 'cover') {
            const leftPageNumber = getPageNumberFromIndex(currentPage, 'left');
            const rightPageNumber = getPageNumberFromIndex(currentPage, 'right');

            return (
                <div className="book-container flex items-center gap-0 book-hover">
                    <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                        <LeftPage
                            isCover={true}
                            onImageClick={() => handleImageClick('left')}
                            appliedImage={getImageForPage(leftPageNumber)}
                            pageNumber={leftPageNumber}
                        />
                    </div>
                    <div className="book-spine-shadow">
                        <TitlePage title={title} userName={userName} />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage
                            isCover={true}
                            onImageClick={() => handleImageClick('right')}
                            title={title}
                            userName={userName}
                            appliedImage={getImageForPage(rightPageNumber)}
                            pageNumber={rightPageNumber}
                        />
                    </div>
                </div>
            );
        } else {
            const leftPageNumber = getPageNumberFromIndex(currentPage, 'left');
            const rightPageNumber = getPageNumberFromIndex(currentPage, 'right');

            return (
                <div className="book-container flex items-center gap-0 book-hover">
                    <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                        <LeftPage
                            isCover={false}
                            isLastPage={currentPageData.title === '13페이지'}
                            onImageClick={() => handleImageClick('left')}
                            title={title}
                            userName={userName}
                            appliedImage={getImageForPage(leftPageNumber)}
                            pageNumber={leftPageNumber}
                        />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage
                            isCover={false}
                            isLastPage={currentPageData.title === '13페이지'}
                            onImageClick={() => handleImageClick('right')}
                            title={title}
                            userName={userName}
                            appliedImage={getImageForPage(rightPageNumber)}
                            pageNumber={rightPageNumber}
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-98px)]">
            {/* 제목 입력 텍스트 - 정중앙 */}
            <div className="font-noto font-medium text-2xl text-black mb-5">
                {title || '제목을 입력하세요'}
            </div>

            {/* 책과 PDF 버튼을 감싸는 컨테이너 */}
            <div className="relative mb-[10px]">
                {/* PDF 버튼 - 책 오른쪽 상단 */}
                <div className="absolute -top-12 -right-4 z-10">
                    <PdfButton onClick={handlePdfExport} />
                </div>

                {/* 책 모양 */}
                <div className="page-fade fade-in">
                    {renderBook()}
                </div>
            </div>

            {/* 페이지 네비게이션 */}
            <div className="flex items-center justify-between w-40 mt-5">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || isFlipping}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                >
                    <ChevronLeft size={20} className="text-[#A1A1A1]" />
                </button>
                <span
                    className={`font-noto font-medium text-base text-[#A1A1A1] page-fade fade-in transition-all duration-300 ${isFlipping ? 'opacity-50' : 'opacity-100'}`}
                >
                    {pages[currentPage].title === '1-2페이지' ? '1-2 페이지' :
                        pages[currentPage].title === '3-4페이지' ? '3-4 페이지' :
                            pages[currentPage].title === '5-6페이지' ? '5-6 페이지' :
                                pages[currentPage].title === '7-8페이지' ? '7-8 페이지' :
                                    pages[currentPage].title === '9-10페이지' ? '9-10 페이지' :
                                        pages[currentPage].title === '11-12페이지' ? '11-12 페이지' :
                                            pages[currentPage].title}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === pages.length - 1 || isFlipping}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={20} className="text-[#A1A1A1]" />
                </button>
            </div>

            {/* ImageModal */}
            <ImageModal
                isOpen={isImageModalOpen}
                onClose={handleCloseModal}
                currentPageIndex={getCurrentPageIndex()}
                onImageApplied={handleImageApplied}
            />
        </div>
    );
};

export default CreateImage;