import React from 'react';
import sunIcon from '@/assets/sun.svg';

const LeftPage = ({ isCover = false, onImageClick }) => {
    return (
        <div className={`w-[499px] h-[512px] ${isCover ? 'bg-white' : 'bg-custom-jk_light_yellow'} drop-shadow-[-4px_4px_4px_rgba(0,0,0,0.25)] flex justify-center items-center relative`}>
            {isCover ? (
                /* 표지인 경우 */
                <div
                    className="w-[133px] h-[133px] bg-custom-jk_light_yellow rounded-lg flex justify-center items-center cursor-pointer"
                    onClick={onImageClick}
                >
                    <img src={sunIcon} alt="Sun" className="w-[56px] h-[56px]" />
                </div>
            ) : (
                /* 일반 페이지인 경우 */
                <div
                    className="w-full h-full flex justify-center items-center cursor-pointer"
                    onClick={onImageClick}
                >
                    <img src={sunIcon} alt="Sun" className="w-[56px] h-[56px]" />
                </div>
            )}
        </div>
    );
};

export default LeftPage;