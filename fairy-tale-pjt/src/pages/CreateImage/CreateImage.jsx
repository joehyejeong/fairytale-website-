import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PdfButton from '../../components/PdfButton';
import LeftPage from './LeftPage';
import RightPage from './RightPage';
import TitlePage from './TitlePage';
import ImageModal from '../ImageModal/ImageModal';
import useStoryStore from '@/stores/storyStore';
import '../../styles/animations.css'

const CreateImage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState('');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [clickedPageSide, setClickedPageSide] = useState(null); // 'left' or 'right'
    const [imageUpdateTrigger, setImageUpdateTrigger] = useState(0); // 강제 리렌더링용

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
        { type: 'last', title: '13페이지' }
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
        try {
            console.log('기존 이미지 로드 확인 중...');
            // 여기서는 예시로 빈 로직으로 남겨둡니다
            // 실제로는 electron API를 통해 saves 폴더의 파일들을 확인해야 합니다
        } catch (error) {
            console.error('기존 이미지 로드 실패:', error);
        }
    };

    // 페이지별 이미지 경로 가져오기 (수정됨)
    const getImageForPage = (pageNumber) => {
        const imagePath = getAppliedImage(pageNumber);
        console.log(`getImageForPage - 페이지 ${pageNumber}:`, imagePath);

        if (!imagePath || imagePath === 'null' || imagePath === null) {
            return null;
        }

        // 절대 경로인 경우 file:// 프로토콜 사용
        if (imagePath.startsWith('/') || imagePath.match(/^[A-Za-z]:/)) {
            return `file://${imagePath}`;
        }

        // 상대 경로인 경우 그대로 반환
        return imagePath;
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
        console.log('handleImageApplied 호출됨:', applyResult);

        // 이미지 적용 후 상태 업데이트
        if (applyResult && applyResult.success) {
            const pageNumber = applyResult.pageNumber;

            // 스토어에 저장
            setAppliedImage(pageNumber, applyResult.imagePath);

            console.log(`페이지 ${pageNumber}에 이미지 적용됨:`, applyResult.imagePath);

            // 강제 리렌더링 트리거
            setImageUpdateTrigger(prev => prev + 1);

            // 모달 닫기
            setTimeout(() => {
                handleCloseModal();
            }, 500); // 약간의 딜레이 후 모달 닫기
        }
    };

    // 디버깅용: 현재 페이지의 이미지 상태 확인
    useEffect(() => {
        console.log('현재 페이지 상태:', {
            currentPage,
            imageUpdateTrigger,
            appliedImage: getAppliedImage(currentPage),
            processedImage: getImageForPage(currentPage)
        });
    }, [currentPage, imageUpdateTrigger]);

    const renderBook = () => {
        // 현재 페이지의 이미지 경로 가져오기
        const currentPageImage = getImageForPage(currentPage);

        return (
            <div className="book-container flex items-center gap-0 book-hover">
                <div className={`book-page left-page page-shadow page-depth ${isFlipping && flipDirection === 'left' ? 'flipping-left' : ''}`}>
                    <LeftPage
                        isType={pages[currentPage].type}
                        isLastPage={pages[currentPage].title === '13페이지'}
                        onImageClick={() => handleImageClick('left')}
                        title={title}
                        userName={userName}
                        appliedImage={currentPageImage}
                        pageNumber={currentPage}
                        key={`left-${currentPage}-${imageUpdateTrigger}`} // 강제 리렌더링을 위한 key
                    />
                </div>

                {pages[currentPage].type === 'cover' && (
                    <div className="book-spine-shadow">
                        <TitlePage title={title} userName={userName} />
                    </div>
                )}

                <div className={`book-page right-page page-shadow page-depth ${isFlipping && flipDirection === 'right' ? 'flipping-right' : ''}`}>
                    <RightPage
                        isType={pages[currentPage].type}
                        isLastPage={pages[currentPage].title === '13페이지'}
                        onImageClick={() => handleImageClick('right')}
                        title={title}
                        userName={userName}
                        appliedImage={currentPageImage}
                        pageNumber={currentPage}
                        key={`right-${currentPage}-${imageUpdateTrigger}`} // 강제 리렌더링을 위한 key
                    />
                </div>
            </div>
        );
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
                <div className="page-fade fade-in" key={`book-${currentPage}-${imageUpdateTrigger}`}>
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
                    {pages[currentPage].title}
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
                currentPageIndex={currentPage}
                onImageApplied={handleImageApplied}
            />
        </div>
    );
}

export default CreateImage;