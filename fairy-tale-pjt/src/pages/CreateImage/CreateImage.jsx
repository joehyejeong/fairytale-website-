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

    // Zustand store에서 동화책 데이터 가져오기
    const { getBookData, getTitle, getPageContent, getName } = useStoryStore();
    const bookData = getBookData();
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

    // 페이지별 내용 매핑 (좌우 페이지)
    const getPageContentForDisplay = (pageIndex) => {
        if (pageIndex === 0) return ''; // 표지는 빈 내용

        // 페이지 인덱스에 따라 적절한 내용 반환
        // 0: 표지, 1: 1-2페이지, 2: 3-4페이지, 3: 5-6페이지, 4: 7-8페이지, 5: 9-10페이지, 6: 11-12페이지, 7: 13페이지
        return getPageContent(pageIndex) || '';
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

    const handleImageClick = () => {
        console.log('이미지 클릭');
        setIsImageModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsImageModalOpen(false);
    };

    const renderBook = () => {
        const currentPageData = pages[currentPage];

        if (currentPageData.type === 'cover') {
            return (
                <div className="book-container flex items-center gap-0 book-hover">
                    <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                        <LeftPage isCover={true} onImageClick={handleImageClick} />
                    </div>
                    <div className="book-spine-shadow">
                        <TitlePage title={title} userName={userName} />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage
                            isCover={true}
                            content={getPageContentForDisplay(currentPage)}
                            onImageClick={handleImageClick}
                            title={title}
                            userName={userName}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="book-container flex items-center gap-0 book-hover">
                    <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                        <LeftPage
                            isCover={false}
                            isLastPage={currentPageData.title === '13페이지'}
                            content={getPageContentForDisplay(currentPage)}
                            onImageClick={handleImageClick}
                            title={title}
                            userName={userName}
                        />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage
                            isCover={false}
                            isLastPage={currentPageData.title === '13페이지'}
                            content={getPageContentForDisplay(currentPage)}
                            onImageClick={handleImageClick}
                            title={title}
                            userName={userName}
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
            />
        </div>
    );
};

export default CreateImage;
