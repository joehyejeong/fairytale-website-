import React, { useState } from 'react';
import sunIcon from '@/assets/sun.svg';
import IconButton from '@/components/IconButton';
import useStoryStore from '@/stores/storyStore';

const RightPage = ({
    isType = content,
    isLastPage = false,
    onImageClick,
    title = "",
    userName = "",
    appliedImage = null,
    pageNumber = 0
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    // 스토어에서 함수들 가져오기: 텍스트 가져오기
    const { getPageContent, getAppliedImage } = useStoryStore();

    React.useEffect(() => { //getPageContent에 pageNumber(0~13중)
        if (pageNumber && (isType == 'content')) { // 이렇게 쓰는게 맞나?
            // Page
            const content = getPageContent(pageNumber);
            setEditedContent(content || '');
        }
    }, [pageNumber, getPageContent]);

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
        const imageUrl = appliedImage || (pageNumber >= 0 ? `file://${getAppliedImage(pageNumber)}` : null);

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
            {isType == 'cover' ? (
                /* 표지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div className="w-full h-full">
                    {/* 상단 이미지 영역 - jk_light_yellow 배경만 클릭 가능 */}
                    <div
                        className="w-[494px] h-[388px] bg-custom-jk_light_yellow flex justify-center items-center cursor-pointer transition-transform hover:scale-105 relative overflow-hidden"
                        onClick={onImageClick}

                    // style={{
                    //     backgroundImage: (appliedImage || getAppliedImage(pageNumber)) ? `url(${appliedImage || `file://${getAppliedImage(pageNumber)}`})` : 'none',
                    //     backgroundSize: 'cover',
                    //     backgroundPosition: 'center',
                    //     backgroundRepeat: 'no-repeat'
                    // }}
                    >
                        {/* 이미지가 있을 때 이미지 넣고, 이미지가 없을 때만 아이콘 표시 */}
                        {renderImage()}

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
            {isType != 'cover' && !isLastPage && (
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