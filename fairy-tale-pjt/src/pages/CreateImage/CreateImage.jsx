import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PdfButton from '../../components/PdfButton';
import LeftPage from './LeftPage';
import RightPage from './RightPage';
import TitlePage from './TitlePage';

const CreateImage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState('');

    const pages = [
        { type: 'cover', title: '표지' },
        { type: 'content', title: '1-2페이지' },
        { type: 'content', title: '3-4페이지' },
        { type: 'content', title: '5-6페이지' },
        { type: 'content', title: '7-8페이지' },
        { type: 'content', title: '9-10페이지' },
        { type: 'content', title: '11-12페이지' },
        { type: 'content', title: '마지막장' }
    ];

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
        // 이미지 클릭 로직 구현
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
                        <TitlePage />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage isCover={true} onImageClick={handleImageClick} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="book-container flex items-center gap-0 book-hover">
                    <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                        <LeftPage isCover={false} onImageClick={handleImageClick} />
                    </div>
                    <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                        <RightPage isCover={false} onImageClick={handleImageClick} />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-98px)]">
            {/* 제목 입력 텍스트 - 정중앙 */}
            <div
                style={{
                    fontFamily: 'Noto Sans KR',
                    fontWeight: 500,
                    fontSize: '24px',
                    color: 'black',
                    marginBottom: '20px'
                }}
            >
                제목을 입력하세요
            </div>

            {/* 책과 PDF 버튼을 감싸는 컨테이너 */}
            <div className="relative" style={{ marginBottom: '10px' }}>
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
            <div className="flex items-center justify-center gap-5 mt-[20px]">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || isFlipping}
                    className="transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                >
                    <ChevronLeft size={20} color="#A1A1A1" />
                </button>
                <span
                    style={{
                        fontFamily: 'Noto Sans KR',
                        fontWeight: 500,
                        fontSize: '16px',
                        color: '#A1A1A1'
                    }}
                    className={`page-fade fade-in transition-all duration-300 ${isFlipping ? 'opacity-50' : 'opacity-100'}`}
                >
                    {pages[currentPage].title}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === pages.length - 1 || isFlipping}
                    className="transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={20} color="#A1A1A1" />
                </button>
            </div>
        </div>
    );
};

export default CreateImage;
