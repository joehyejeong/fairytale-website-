import React, { useState } from 'react';
import sunIcon from '@/assets/sun.svg';
import IconButton from '@/components/IconButton';

const RightPage = ({ isCover = false, isLastPage = false, content = "오늘은 정말 비가 많이 오는 날이었어요.\n지우는 동생을 보며 모두가 우산을 쓰고 있네요.\n지우는 학교에 가려고 집을 나섰을 때 깜짝 놀랐어요.\n우산을 잃어버렸거든요.\n'어떻게 해야 하지?' 지우는 정말 걱정이 많았어요.\n하지만 어쩔 수 없이 비 속을 걸어가기 시작했어요.", onImageClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // 여기에 저장 로직 추가
    };

    return (
        <div className="w-[599px] h-[614px] bg-white drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)] relative">
            {isCover ? (
                /* 표지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div className="w-full h-full">
                    {/* 상단 이미지 영역 - jk_light_yellow 배경만 클릭 가능 */}
                    <div
                        className="w-[594px] h-[466px] bg-custom-jk_light_yellow flex justify-center items-center cursor-pointer transition-transform"
                        onClick={onImageClick}
                    >
                        <img src={sunIcon} alt="Sun" className="w-[67px] h-[67px]" />
                    </div>

                    {/* 제목 - 클릭 불가능 */}
                    <div className="mt-[20px] text-center">
                        <h1 className="text-4xl font-bold font-noto text-black">
                            [제목을 입력해 주세요]
                        </h1>
                    </div>

                    {/* 저자 - 클릭 불가능 */}
                    <div className="mt-[20px] text-center">
                        <p className="text-[16px] font-medium font-noto text-black">
                            [직코] 지음
                        </p>
                    </div>
                </div>
            ) : (
                /* 일반 페이지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
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
                                    {editedContent}
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
                                <span className="material-symbols-outlined text-custom-jk_yellow" style={{ fontSize: '23px', width: '23px', height: '23px' }}>edit</span>
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