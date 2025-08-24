import React, { useState } from 'react';
import BasicButton from '@/components/BasicButton';

const Name = () => {
    const [userName, setUserName] = useState('');

    const handleStart = () => {
        // 시작하기 버튼 클릭 시 처리 로직
        console.log('시작하기 클릭됨:', userName);
    };

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