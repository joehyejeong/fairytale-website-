import React from 'react';

const BasicButton = ({ text, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="mx-12 my-4 bg-custom-jk_blue text-white font-medium text-2xl font-noto flex justify-center items-center px-[46px] py-4 rounded-[5px]"
        >
            {text}
        </button>
    );
};

export default BasicButton;