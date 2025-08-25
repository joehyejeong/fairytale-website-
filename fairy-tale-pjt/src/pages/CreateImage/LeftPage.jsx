import React from 'react';
import sunIcon from '@/assets/sun.svg';

const LeftPage = ({ isCover = false, isLastPage = false, onImageClick }) => {
    if (isLastPage) {
        return (
            <div className="w-[599px] h-[614px] p-[12px] bg-white drop-shadow-[-4px_4px_4px_rgba(0,0,0,0.25)] relative">
                <div className="flex flex-col items-start pt-[226px]">
                    {/* (1) 이미지 공간 */}
                    <div
                        className="w-[160px] h-[158px] bg-custom-jk_light_yellow rounded-lg flex justify-center items-center cursor-pointer transition-transform"
                        onClick={onImageClick}
                    >
                        <img src={sunIcon} alt="Sun" className="w-[67px] h-[67px]" />
                    </div>

                    {/* (2) 제목 텍스트 */}
                    <div className="mt-[12px] font-noto font-medium text-lg text-black">
                        제목을 입력해주세요
                    </div>

                    {/* (3) 메타데이터 3개 */}
                    <div className="mt-[37px] space-y-[7px]">
                        {/* 첫번째: 발행일 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                발행일
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                2025년 00월 00일
                            </span>
                        </div>

                        {/* 두번째: 지은이 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                지은이
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                직코
                            </span>
                        </div>

                        {/* 세번째: 제작 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                제작
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                직코BOOK
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-[599px] h-[614px] ${isCover ? 'bg-white' : 'bg-custom-jk_light_yellow'} drop-shadow-[-4px_4px_4px_rgba(0,0,0,0.25)] flex justify-center items-center relative`}>
            {isCover ? (
                /* 표지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div
                    className="w-[160px] h-[160px] bg-custom-jk_light_yellow rounded-lg flex justify-center items-center cursor-pointer transition-transform"
                    onClick={onImageClick}
                >
                    <img src={sunIcon} alt="Sun" className="w-[67px] h-[67px]" />
                </div>
            ) : (
                /* 일반 페이지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div
                    className="w-full h-full flex justify-center items-center cursor-pointer transition-transform"
                    onClick={onImageClick}
                >
                    <img src={sunIcon} alt="Sun" className="w-[67px] h-[67px]" />
                </div>
            )}
        </div>
    );
};

export default LeftPage;