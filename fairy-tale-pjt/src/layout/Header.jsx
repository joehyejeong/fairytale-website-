import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import smallLogo from '/small_logo.svg';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import useStoryStore from '@/stores/storyStore';
import ConfirmDialog from '@/components/ConfirmDialog';
import { testAllAIConnections } from '@/lib/aiConnectionTest';

const Header = () => {
    const [language, setLanguage] = useState('한국어');
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [aiConnectionStatus, setAiConnectionStatus] = useState({
        text: false,
        image: false
    });
    const navigate = useNavigate();
    const { getBookData, getTitle, getName, reset } = useStoryStore();

    // AI 연결 상태 테스트
    useEffect(() => {
        const testConnections = async () => {
            console.log('🚀 Header에서 AI 연결 테스트 시작');
            try {
                const status = await testAllAIConnections();
                console.log('📊 Header에서 받은 AI 상태:', status);
                setAiConnectionStatus(status);
                console.log('✅ AI 연결 상태 업데이트 완료');
            } catch (error) {
                console.error('💥 Header에서 AI 연결 테스트 실패:', error);
            }
        };

        // 이미지 모델 연결 테스트
        const testImageConnection = async () => {
            console.log('🖼️ 이미지 모델 연결 테스트 시작');

            try {
                // 간단한 이미지 생성 테스트 (빈 설명으로)
                const result = await window.electronAPI.generateImage({
                    description: 'test connection',
                    style: '수채화 일러스트',
                    pageNumber: 1
                });

                if (result.success) {
                    console.log('✅ 이미지 모델 연결 성공');
                    setAiConnectionStatus(prev => ({ ...prev, image: true }));
                } else {
                    console.log('❌ 이미지 모델 연결 실패:', result.error);
                    setAiConnectionStatus(prev => ({ ...prev, image: false }));
                }
            } catch (error) {
                console.error('💥 이미지 모델 연결 테스트 오류:', error);
                setAiConnectionStatus(prev => ({ ...prev, image: false }));
            }
        };

        // 컴포넌트 마운트 후 1초 뒤에 연결 테스트 실행 (스플래시 화면 중에 테스트)
        console.log('⏰ Header 마운트, 1초 후 AI 테스트 예약');
        const timer = setTimeout(async () => {
            // 텍스트와 이미지 모델을 병렬로 테스트
            await Promise.all([
                testConnections(),
                testImageConnection()
            ]);
        }, 1000);

        return () => {
            console.log('🧹 Header 언마운트, 타이머 정리');
            clearTimeout(timer);
        };
    }, []);

    return (
        <header className="h-12 w-full min-w-[1050px] bg-custom-jk_yellow flex items-center justify-between px-5">
            {/* Left side - Logo and Language */}
            <div className="flex items-center">
                {/* Logo with 5px left margin */}
                <img
                    src={smallLogo}
                    alt="직코BOOK 로고"
                    className="w-auto h-auto ml-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowResetDialog(true)}
                />

                {/* Language Dropdown with 75px margins */}
                <div className="flex items-center mx-18">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center hover:text-custom-jk_dark_yellow transition-colors">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '19px', width: '19px' }}>
                                language
                            </span>
                            <span className="material-symbols-outlined text-white ml-1" style={{ fontSize: '8px', width: '5px' }}>
                                arrow_drop_down
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="border border-custom-jk_dark_yellow bg-white z-50"
                            style={{ width: '64px', height: '60px' }}
                        >
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('English')}
                            >
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('한국어')}
                            >
                                한국어
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('简体中文')}
                            >
                                简体中文
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Vertical dotted line - 7 equal parts with 2.5px gaps */}
                <div className="mx-4">
                    <div className="h-6 w-px bg-custom-jk_dark_yellow relative">
                        <div className="absolute top-0 left-0 w-full h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full bg-custom-jk_dark_yellow"
                                    style={{
                                        top: `${(i * 100) / 7}%`,
                                        height: `${100 / 14}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Text Model Status */}
                <div className="flex items-center mx-4">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '23.33px', width: '21.93px' }}>
                        {aiConnectionStatus.text ? 'link' : 'link_off'}
                    </span>
                    <span className="ml-2 text-white font-sans font-bold text-sm">
                        {aiConnectionStatus.text ? '텍스트 모델 연결됨' : '텍스트 모델 연결 안 됨'}
                    </span>
                </div>

                {/* Vertical dotted line */}
                <div className="mx-4">
                    <div className="h-6 w-px bg-custom-jk_dark_yellow relative">
                        <div className="absolute top-0 left-0 w-full h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full bg-custom-jk_dark_yellow"
                                    style={{
                                        top: `${(i * 100) / 7}%`,
                                        height: `${100 / 14}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Image Model Status */}
                <div className="flex items-center mx-4">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '23.33px', width: '21.93px' }}>
                        {aiConnectionStatus.image ? 'link' : 'link_off'}
                    </span>
                    <span className="ml-2 text-white font-sans font-bold text-sm">
                        {aiConnectionStatus.image ? '이미지 모델 연결됨' : '이미지 모델 연결 안 됨'}
                    </span>
                </div>
            </div>

            {/* Right side - Search, File, Settings */}
            <div className="flex items-center">
                {/* Search Input with 193px margin */}
                <div className="mr-5">
                    <input
                        type="text"
                        placeholder="동화책 제작 프로젝트"
                        className="px-3 py-2 border border-custom-jk_dark_yellow bg-custom-jk_light_yellow text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-custom-jk_dark_yellow rounded"
                        style={{ width: '110px', height: '35px' }}
                    />
                </div>

                {/* File Dropdown */}
                <div className="mr-12">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center hover:text-custom-jk_dark_yellow transition-colors">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px', width: '20px' }}>
                                folder
                            </span>
                            <span className="ml-1 text-white font-sans font-bold text-sm">파일</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="border border-custom-jk_dark_yellow bg-custom-jk_yellow z-50"
                            style={{ width: '187px', height: '106px' }}
                        >
                            <DropdownMenuItem className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer">
                                새로 만들기
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer">
                                내 컴퓨터에서 불러오기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={async () => {
                                    try {
                                        const bookData = getBookData();
                                        const title = getTitle();
                                        const userName = getName();

                                        if (bookData && (bookData.title || bookData.page1)) {
                                            const saveData = {
                                                title: title || '동화책',
                                                author: userName || '직코',
                                                pages: [],
                                                timestamp: new Date().toISOString()
                                            };

                                            // 페이지 데이터 구성
                                            for (let i = 1; i <= 6; i++) {
                                                const pageKey = `page${i}`;
                                                if (bookData[pageKey]) {
                                                    saveData.pages.push({
                                                        page: i,
                                                        content: bookData[pageKey]
                                                    });
                                                }
                                            }

                                            if (saveData.pages.length > 0) {
                                                const result = await window.electronAPI.saveFile(saveData);

                                                if (result.success) {
                                                    alert(`파일이 성공적으로 저장되었습니다!\n경로: ${result.filePath}`);
                                                } else if (result.canceled) {
                                                    console.log('파일 저장이 취소되었습니다.');
                                                } else {
                                                    alert(`파일 저장에 실패했습니다: ${result.error}`);
                                                }
                                            } else {
                                                alert('저장할 동화책 내용이 없습니다.');
                                            }
                                        } else {
                                            alert('저장할 동화책 데이터가 없습니다.');
                                        }
                                    } catch (error) {
                                        console.error('파일 저장 오류:', error);
                                        alert('파일 저장 중 오류가 발생했습니다.');
                                    }
                                }}
                            >
                                컴퓨터에 저장하기
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Settings Icon with 13px margin */}
                <div className="mr-3">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '19px' }}>
                        settings
                    </span>
                </div>
            </div>

            {/* 확인 다이얼로그 */}
            <ConfirmDialog
                isOpen={showResetDialog}
                title="초기화 확인"
                message="모든 정보가 사라집니다. 정말 돌아가시겠습니까?"
                confirmText="네"
                cancelText="취소"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                cancelButtonClass="bg-gray-500 hover:bg-gray-600"
                onConfirm={() => {
                    // Zustand store의 모든 정보 초기화
                    reset();
                    // 초기 페이지로 이동
                    navigate('/');
                    // 다이얼로그 닫기
                    setShowResetDialog(false);
                }}
                onCancel={() => setShowResetDialog(false)}
            />
        </header>
    );
};

export default Header;
