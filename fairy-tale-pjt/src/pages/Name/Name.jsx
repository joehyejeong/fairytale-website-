import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicButton from '@/components/BasicButton';
import useStoryStore from '@/stores/storyStore';
import Lending from '../Lending/Lending';

const Name = () => {
    const [userName, setUserName] = useState('');
    const [showSplash, setShowSplash] = useState(true);
    const navigate = useNavigate();
    const { saveName } = useStoryStore();

    const handleStart = () => {
        // 이름을 Zustand store에 저장
        if (userName.trim()) {
            saveName(userName.trim());
        }
        // 시작하기 버튼 클릭 시 PrePlot 페이지로 이동
        console.log('시작하기 클릭됨:', userName);
        navigate('/pre-plot');
    };

    // 스플래시 화면 표시
    if (showSplash) {
        return (
            <Lending onComplete={() => setShowSplash(false)} />
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center">
            <div className="text-center">
                <h1 className="text-5xl font-medium font-noto text-gray-800 mb-8">
                    안녕하세요 {userName} 작가님!
                </h1>

                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-[617px] h-[94px] border border-custom-jk_yellow rounded-lg px-4 text-center text-3xl font-light font-noto mb-8 focus:outline-none focus:border-custom-jk_yellow"
                />

                <div className="flex justify-center">
                    <BasicButton text="시작하기" onClick={handleStart} />
                </div>
            </div>
        </div>
    );
};

export default Name;