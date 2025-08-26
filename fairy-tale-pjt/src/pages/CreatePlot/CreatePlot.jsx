import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BasicButton from '../../components/BasicButton';
import IconButton from '../../components/IconButton';
import useStoryStore from '../../stores/storyStore';

const CreatePlot = () => {
    const [selectedPlot, setSelectedPlot] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [editedTopic, setEditedTopic] = useState('');
    const [editedBackground, setEditedBackground] = useState('');
    const [editedCharacter, setEditedCharacter] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [userInput, setUserInput] = useState(null);
    const [isGeneratingBook, setIsGeneratingBook] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { getName } = useStoryStore();

    useEffect(() => {
        // route state에서 AI 응답과 사용자 입력 가져오기
        const { aiResponse: routeAiResponse, userInput: routeUserInput } = location.state || {};

        console.log('🔍 route state에서 읽어온 데이터:');
        console.log('aiResponse:', routeAiResponse);
        console.log('userInput:', routeUserInput);

        if (!routeAiResponse) {
            console.log('❌ aiResponse가 없음 - PrePlot으로 이동');
            navigate('/pre-plot');
            return;
        }

        try {
            console.log('✅ route state 데이터:');
            console.log('aiResponse:', routeAiResponse);
            console.log('userInput:', routeUserInput);

            setAiResponse(routeAiResponse);
            setUserInput(routeUserInput);

            // 첫 번째 줄거리로 초기값 설정
            if (Array.isArray(routeAiResponse) && routeAiResponse.length > 0) {
                const firstPlot = routeAiResponse[0];
                console.log('📖 첫 번째 줄거리:', firstPlot);

                setEditedTitle(firstPlot.title || '');
                setEditedTopic(routeUserInput.topic || '');
                setEditedBackground(firstPlot.background || 'AI가 생성한 배경 설정');
                setEditedCharacter(firstPlot.character || '');
                setEditedContent(firstPlot.plot || '');
            } else {
                console.log('⚠️ routeAiResponse가 배열이 아니거나 비어있음');
                console.log('routeAiResponse 타입:', typeof routeAiResponse);
                console.log('routeAiResponse 길이:', Array.isArray(routeAiResponse) ? routeAiResponse.length : '배열 아님');
            }
        } catch (error) {
            console.error('❌ route state 처리 오류:', error);
            navigate('/pre-plot');
        }
    }, [navigate, location.state]);

    // 선택된 줄거리 변경 시 편집 내용 업데이트
    useEffect(() => {
        if (aiResponse && Array.isArray(aiResponse) && aiResponse[selectedPlot]) {
            const selectedPlotData = aiResponse[selectedPlot];
            setEditedTitle(selectedPlotData.title || '');
            setEditedContent(selectedPlotData.plot || '');
            setEditedCharacter(selectedPlotData.character || '');
        }
    }, [selectedPlot, aiResponse]);

    const handlePlotSelect = (plotIndex) => {
        setSelectedPlot(plotIndex);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // 여기에 저장 로직 추가
    };

    const handleGenerateStory = async () => {
        setIsGeneratingBook(true);

        try {
            // 현재 편집된 줄거리 데이터 수집
            const currentPlotData = {
                title: editedTitle,
                character: editedCharacter,
                background: editedBackground,
                plot: editedContent,
                lesson: aiResponse?.[0]?.lesson || "좋은 교훈",
                style: editedTopic
            };

            console.log('동화책 생성 요청:', currentPlotData);

            // Electron API를 통해 동화책 생성 호출
            if (window.electronAPI && window.electronAPI.generateBook) {
                const bookResult = await window.electronAPI.generateBook(currentPlotData);

                console.log('동화책 생성 완료:', bookResult);

                // CreateStory 페이지로 이동하면서 동화책 데이터 전달
                navigate('/create-story', {
                    state: {
                        bookData: bookResult,
                        plotData: currentPlotData
                    }
                });
            } else {
                console.error('Electron API를 찾을 수 없습니다.');
                alert('동화책 생성 API 연결 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('동화책 생성 실패:', error);
            alert('동화책 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsGeneratingBook(false);
        }
    };

    const handleBackToPrePlot = () => {
        // PrePlot 페이지로 이동 (localStorage 클리어 불필요)
        navigate('/pre-plot');
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

    // AI 응답이 없으면 로딩 표시
    if (!aiResponse) {
        return (
            <div className="h-[calc(100vh-98px)] bg-white flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-medium font-noto text-black mb-[14px]">
                        줄거리를 생성하고 있습니다...
                    </h1>
                    <p className="text-base font-medium font-noto text-[#929292] mb-[30px]">
                        잠시만 기다려주세요.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-98px)] bg-white flex flex-col justify-center">
            <div className="text-center">
                {/* 1. 메인 제목 */}
                <h1 className="text-3xl font-medium font-noto text-black mb-[14px]">
                    {getName() || ''} 작가님이 적은 내용으로 줄거리를 만들었어요.
                </h1>

                {/* 2. 서브 제목 */}
                <p className="text-base font-medium font-noto text-[#929292] mb-[30px]">
                    AI와 함께 줄거리를 수정하면서 원하는 내용으로 바꿔 보아요.
                </p>

                {/* 3. 메인 콘텐츠 영역 */}
                <div className="flex flex-row mx-[13px] mb-[2px]">
                    {/* 3-1. 왼쪽 패널 (줄거리 정보) */}
                    <div className="w-[450px] h-[calc(100vh/2)] bg-custom-jk_light_yellow border border-custom-jk_yellow rounded-[5px] p-[25px] relative">
                        {renderTextLine('제목', editedTitle, (e) => setEditedTitle(e.target.value))}
                        {renderTextLine('주제', editedTopic, (e) => setEditedTopic(e.target.value))}
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
                    <div className="ml-[13px] flex-1 bg-custom-jk_light_yellow border border-custom-jk_yellow rounded-[5px] p-[25px] relative">
                        <div className='flex justify-between'>
                            <h3 className="w-[100px] text-xl font-medium font-noto text-black mb-[25px]">
                                줄거리 1
                            </h3>
                            {/* 줄거리 1개만 표시하므로 선택 버튼 제거 */}
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
                <div className='w-full flex justify-between px-[13px]'>
                    {/* 뒤로가기 버튼 */}
                    <BasicButton text="다시 작성하기" onClick={handleBackToPrePlot} />

                    {/* 글 생성하기 버튼 */}
                    <BasicButton
                        text={isGeneratingBook ? "이야기을 만들고 있습니다..." : "선택한 줄거리로 글 생성하기"}
                        onClick={handleGenerateStory}
                        disabled={isGeneratingBook}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreatePlot;