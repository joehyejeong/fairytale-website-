import React, { useEffect, useState } from 'react';
import bigLogo from '/big_logo.svg';

const Lending = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // 3초 후에 스플래시 화면 숨기기
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) {
                onComplete();
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className="min-h-screen bg-custom-jk_yellow flex items-center justify-center animate-fade-in">
            <img
                src={bigLogo}
                alt="직코BOOK 로고"
                className="w-auto h-auto animate-pulse"
            />
        </div>
    );
};

export default Lending;
