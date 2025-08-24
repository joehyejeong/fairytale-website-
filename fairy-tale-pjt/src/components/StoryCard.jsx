import React, { useState } from 'react';
import IconButton from './IconButton';

const StoryCard = ({ pageNumber }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState('[ai 연결 안 됨]');

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // 여기에 저장 로직 추가
    };

    return (
        <div className="w-[402px] h-[calc(100vh/2.2)] bg-custom-jk_light_yellow rounded-[5px] relative flex-shrink-0 text-left">
            {/* 페이지 번호 */}
            <div className="pt-[25px] pl-[25px]">
                <h3 className="text-xl font-medium font-noto text-black">
                    {pageNumber}
                </h3>
            </div>

            {/* 내용 */}
            <div className="pl-[25px] mt-[20px]">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-[calc(100%-50px)] h-[200px] bg-white border border-custom-jk_yellow rounded-[3px] p-[15px] text-base font-light font-noto text-black resize-none outline-none"
                        placeholder="이야기를 입력하세요"
                    />
                ) : (
                    <p className="text-base font-light font-noto text-black leading-[24px]">
                        {content}
                    </p>
                )}
            </div>

            {/* Edit/Save 아이콘 */}
            <div className="absolute bottom-[15px] right-[15px]">
                <IconButton
                    icon={
                        isEditing ? (
                            <span className="material-symbols-outlined text-custom-jk_yellow" style={{ fontSize: '19px', width: '19px', height: '19px' }}>save</span>
                        ) : (
                            <span className="material-symbols-outlined text-custom-jk_yellow" style={{ fontSize: '19px', width: '19px', height: '19px' }}>edit</span>
                        )
                    }
                    onClick={isEditing ? handleSaveClick : handleEditClick}
                />
            </div>
        </div>
    );
};

export default StoryCard;