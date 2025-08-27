import React, { useState } from 'react';
import sunIcon from '@/assets/sun.svg';
import IconButton from '@/components/IconButton';
import useStoryStore from '@/stores/storyStore';

const RightPage = ({
    isCover = false,
    isLastPage = false,
    onImageClick,
    title = "",
    userName = "",
    appliedImage = null,
    pageNumber = 0
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    // 스토어에서 함수들 가져오기
    const { getPageContent, getAppliedImage, getCurrentPageIndex } = useStoryStore();

    // 현재 페이지의 내용 가져오기
    React.useEffect(() => {
        if (pageNumber && !isCover && !isLastPage) {
            // CreateImage의 페이지 인덱스를 실제 내용 페이지로 변환
            const currentPageIdx = getCurrentPageIndex();
            let contentPageNumber = 1;

            if (currentPageIdx === 0) {
                // 표지 페이지
                contentPageNumber = 1;
            } else if (currentPageIdx <= 6) {
                // 1-2페이지(index 1) -> page1, 3-4페이지(index 2) -> page2, ...
                contentPageNumber = currentPageIdx;
            } else {
                // 13페이지는 마지막 페이지
                contentPageNumber = 6;
            }

            const content = getPageContent(contentPageNumber);
            setEditedContent(content || '');
        }
    }, [pageNumber, isCover, isLastPage, getPageContent, getCurrentPageIndex]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // 여기에 저장 로직 추가 (필요하다면 스토어에 저장)
        console.log('저장된 내용:', editedContent);
    };

    const renderImage = () => {
        // props로 전달된 appliedImage 또는 스토어에서 가져온 이미지 사용
        const imageUrl = appliedImage || (pageNumber ? `file://${getAppliedImage(pageNumber)}` : null);

        if (imageUrl && imageUrl !== 'file://null') {
            return (
                <img
                    src={imageUrl}
                    alt="Applied"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                        // 이미지 로드 실패 시 기본 아이콘으로 대체
                        console.error('이미지 로드 실패:', imageUrl);
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallback = document.createElement('img');
                            fallback.src = sunIcon;
                            fallback.alt = 'Sun';
                            fallback.className = 'fallback-icon';
                            fallback.style.width = '67px';
                            fallback.style.height = '67px';
                            parent.appendChild(fallback);
                        }
                    }}
                />
            );
        } else {
            // 기본 태양 아이콘
            return (
                <img
                    src={sunIcon}
                    alt="Sun"
                    className="w-[67px] h-[67px]"
                />
            );
        }
    };

    return (
        <div className="w-[499px] h-[512px] bg-white drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)] relative">
            {isCover ? (
                /* 표지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div className="w-full h-full">
                    {/* 상단 이미지 영역 - jk_light_yellow 배경만 클릭 가능 */}
                    <div
                        className="w-[494px] h-[388px] bg-custom-jk_light_yellow flex justify-center items-center cursor-pointer transition-transform hover:scale-105 relative overflow-hidden"
                        onClick={onImageClick}
                        style={{
                            backgroundImage: (appliedImage || getAppliedImage(pageNumber)) ? `url(${appliedImage || `file://${getAppliedImage(pageNumber)}`})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {/* 이미지가 없을 때만 아이콘 표시 */}
                        {!(appliedImage || getAppliedImage(pageNumber)) && renderImage()}

                        {/* 이미지가 있을 때 오버레이 효과 */}
                        {(appliedImage || getAppliedImage(pageNumber)) && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex justify-center items-center">
                                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 text-white bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                                    이미지 변경
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 제목 - 클릭 불가능 */}
                    <div className="mt-[20px] text-center">
                        <h1 className="text-4xl font-bold font-noto text-black">
                            {title || '[제목을 입력해 주세요]'}
                        </h1>
                    </div>

                    {/* 저자 - 클릭 불가능 */}
                    <div className="mt-[20px] text-center">
                        <p className="text-[16px] font-medium font-noto text-black">
                            {userName ? `${userName} 지음` : '직코 지음'}
                        </p>
                    </div>
                </div>
            ) : (
                /* 일반 페이지인 경우 */
                <div className="w-full h-full flex justify-center items-center p-[30px]">
                    {isLastPage ? (
                        /* 13페이지인 경우 - 완전히 빈 공간 표시 */
                        <div className="w-full h-full bg-white">
                            {/* 아무 내용도 없는 빈 페이지 */}
                        </div>
                    ) : (
                        <>
                            {isEditing ? (
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="w-full h-full bg-white border border-custom-jk_yellow rounded-[4px] p-[18px] text-lg font-light font-noto text-black leading-[36px] resize-none outline-none text-left"
                                    placeholder="이야기를 입력하세요"
                                />
                            ) : (
                                <div className="text-lg font-light font-noto text-black leading-[36px] text-left whitespace-pre-line">
                                    {editedContent || '이야기 내용이 없습니다.'}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Edit/Save 아이콘 */}
            {!isCover && !isLastPage && (
                <div className="absolute bottom-[30px] right-[30px]">
                    <IconButton
                        icon={
                            isEditing ? (
                                <span className="material-symbols-outlined text-custom-jk_yellow" style={{ fontSize: '23px', width: '23px', height: '23px' }}>save</span>
                            ) : (
                                <span className="text-custom-jk_yellow" style={{ fontSize: '23px', width: '23px', height: '23px' }}>edit</span>
                            )
                        }
                        onClick={isEditing ? handleSaveClick : handleEditClick}
                    />
                </div>
            )}
        </div>
    );
};

export default RightPage;