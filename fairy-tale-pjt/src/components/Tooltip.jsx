import React, { useState } from 'react';

const Tooltip = ({ children, content, show = false }) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && (
                <div
                    className="absolute z-50 bg-white border border-[#D9D9D9] rounded-[5px] px-3 py-2"
                    style={{
                        width: '179px', // 119px * 1.5
                        height: '50px', // 33px * 1.5
                        top: '-60px', // -40px * 1.5
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="flex justify-center items-center h-full">
                        <span
                            className="font-noto font-thin text-black text-center leading-tight"
                            style={{ fontSize: '15px' }} // 10px * 1.5
                        >
                            {content}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
