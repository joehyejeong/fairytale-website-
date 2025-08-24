import React from 'react';

const TitlePage = () => {
    const title = "제목을 입력하세요";
    const author = "직코지음";

    return (
        <div className="w-[24px] h-[512px] bg-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center">
                {/* 제목 입력 - 한 글자마다 줄바꿈 */}
                <div className="mt-[35px] text-center">
                    {title.split('').map((char, index) => (
                        <div key={index} className="text-base font-medium font-noto text-black writing-mode-vertical">
                            {char}
                        </div>
                    ))}
                </div>

                {/* 저자 정보 - 한 글자마다 줄바꿈 */}
                <div className="mt-[100px] mb-[13px] text-center">
                    {author.split('').map((char, index) => (
                        <div key={index} className="text-[13px] font-medium font-noto text-black writing-mode-vertical">
                            {char}
                        </div>
                    ))}
                </div>

                {/* 로고 */}
                <div className="mb-[13px]">
                    <img src="/book_logo.svg" alt="Book Logo" />
                </div>
            </div>
        </div>
    );
};

export default TitlePage;