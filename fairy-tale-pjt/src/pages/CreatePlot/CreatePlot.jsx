import React, { useState } from 'react';
import BasicButton from '@/components/BasicButton';
import IconButton from '@/components/IconButton';
import { useNavigate } from 'react-router-dom';

const CreatePlot = () => {
    const [selectedPlot, setSelectedPlot] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('[ai연결을 확인하세요.]');
    const [editedTitle, setEditedTitle] = useState('[ai 연결을 확인하세요.]');
    const [editedTopic, setEditedTopic] = useState('[ai 연결을 확인하세요.]');
    const [editedBackground, setEditedBackground] = useState('[ai 연결을 확인하세요.]');
    const [editedCharacter, setEditedCharacter] = useState('[ai 연결을 확인하세요.]');

    const navigate = useNavigate();

    const handlePlotSelect = (plotNumber) => {
        setSelectedPlot(plotNumber);
    };


    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // 여기에 저장 로직 추가
    };
    const handleGenerateStory = () => {
        navigate('/create-story');
    };


    // 한 줄 텍스트 함수
    const renderTextLine = (label, value, onChange) => (
        <div className="flex items-center mb-[19px]">
            <span className="text-xl font-medium font-noto text-black mr-[28px]">
                {label}
            </span>
            {isEditing ? (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    className="text-base font-light font-noto text-black bg-white border border-custom-jk_yellow rounded-[3px] px-[10px] py-[5px] outline-none"
                />
            ) : (
                <span className="text-base font-light font-noto text-black">
                    {value}
                </span>
            )}
        </div>
    );

    return (
        <div className="h-[calc(100vh-98px)] bg-white flex flex-col justify-center  ">
            <div className="text-center ">
                {/* 1. 메인 제목 */}
                <h1 className="text-3xl font-medium font-noto text-black mb-[14px]">
                    직코 작가님이 적은 내용으로 줄거리를 만들었어요.
                </h1>

                {/* 2. 서브 제목 */}
                <p className="text-base font-medium font-noto text-[#929292] mb-[30px]">
                    AI와 함께 줄거리를 수정하면서 원하는 내용으로 바꿔 보아요.
                </p>

                {/* 3. 메인 콘텐츠 영역 */}
                <div className="flex flex-row mx-[100px] mb-[2px]">
                    {/* 3-1. 왼쪽 패널 (줄거리 정보) */}
                    <div className="w-[450px] h-[calc(100vh/2)] bg-custom-jk_light_yellow border border-custom-jk_yellow rounded-[5px] p-[25px] relative">
                        {renderTextLine('제목', editedTitle, (e) => setEditedTitle(e.target.value))}
                        {renderTextLine('주제', editedTopic, (e) => setEditedTitle(e.target.value))}
                        {renderTextLine('배경', editedBackground, (e) => setEditedBackground(e.target.value))}
                        {renderTextLine('인물', editedCharacter, (e) => setEditedCharacter(e.target.value))}

                        {/* Edit/Save 아이콘 */}
                        <div className="absolute bottom-[20px] right-[20px]">
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

                    {/* 3-2. 오른쪽 패널 (줄거리 내용) */}
                    <div className="ml-[13px] flex-1 bg-custom-jk_light_yellow border border-custom-jk_yellow rounded-[5px] p-[25px] relative ">
                        <div className='flex justify-between'>
                            <h3 className="w-[100px] text-xl font-medium font-noto text-black mb-[25px]">
                                줄거리 {selectedPlot}
                            </h3>
                            {/* 줄거리 1,2,3 표시하는 부분 - 추후 컴포넌트화 */}
                            <div className="w-full ">
                                <div className="w-[calc(100vw/12)] flex justify-between mx-auto mb-[20px] mr-[30px] ">
                                    {[1, 2, 3].map((plotNumber) => (
                                        <button
                                            key={plotNumber}
                                            onClick={() => handlePlotSelect(plotNumber)}
                                            className={`w-[19px] h-[19px] rounded-full transition-colors duration-200 ${selectedPlot === plotNumber
                                                ? 'bg-custom-jk_yellow'
                                                : 'bg-white border border-custom-jk_yellow'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>


                        {isEditing ? (
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-[120px] bg-white border border-custom-jk_yellow rounded-[5px] p-[15px] text-xl font-light font-noto text-black leading-[30px] resize-none outline-none text-left"
                                placeholder="줄거리를 입력하세요"
                            />
                        ) : (
                            <p className="text-xl font-light font-noto text-black leading-[30px] text-left">
                                {editedContent}
                            </p>
                        )}

                        {/* Edit/Save 아이콘 */}
                        <div className="absolute bottom-[20px] right-[20px]">
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
                </div>

                {/* 4. 하단 버튼 영역 */}
                {/*글 생성하기 버튼 */}
                <div className='w-full flex justify-end '>
                    <div className='mr-[100px]'>
                        <BasicButton text="선택한 줄거리로 글 생성하기" onClick={handleGenerateStory} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlot;