import React from 'react';
import bigLogo from '@/public/big_logo.svg';

const Lending = () => {
    return (
        <div className="min-h-screen bg-custom-jk_yellow flex items-center justify-center">
            <img
                src={bigLogo}
                alt="직코BOOK 로고"
                className="w-auto h-auto"
            />
        </div>
    );
};

export default Lending;
