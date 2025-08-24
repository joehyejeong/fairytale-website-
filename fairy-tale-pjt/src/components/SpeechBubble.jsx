import React from 'react';

const SpeechBubble = ({ text }) => {
    return (
        <div className="relative ml-2">
            <div className="bg-[#EAEAEA] border border-[#5C5050] px-4 py-4 rounded-[3px] h-[58px] flex items-center w-fit relative">
                <p className="text-gray-800 font-light text-xl font-noto text-center whitespace-nowrap">
                    {text}
                </p>
                {/* <div className="absolute -bottom-3 left-5 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#EAEAEA]"></div> */}
                <div className="absolute -bottom-3 left-5 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#5C5050]"></div>
            </div>
        </div>
    );
};

export default SpeechBubble;